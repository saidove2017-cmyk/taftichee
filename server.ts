import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface Mission {
  id: string;
  inspectorName: string;
  rentalNumber: string;
  missionType: string;
  missionDate: string;
  destination1: string;
  destination2?: string;
  destination3?: string;
  companion1?: string;
  companion2?: string;
  companion3?: string;
  notes?: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'missions.json');

// Initial realistic dataset
const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm-101',
    inspectorName: 'ذ. عبد العزيز الفاسي',
    rentalNumber: '1048293',
    missionType: 'زيارة تفتيشية وتأطيرية',
    missionDate: '2026-09-15',
    destination1: 'ثانوية ابن رشد التأهيلية',
    destination2: 'إعدادية الفارابي',
    destination3: 'ملحقة القدس',
    companion1: 'ذ. مصطفى البقالي',
    companion2: 'ذة. فاطمة الزهراء المنصوري',
    companion3: 'ذ. كريم التازي',
    notes: 'مهمة تفتيش شاملة لهيئة التدريس والاطلاع على الترتيبات البيداغوجية.',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'm-102',
    inspectorName: 'ذة. نادية العلمي',
    rentalNumber: '1120944',
    missionType: 'مراقبة مستمرة وتتبع بيداغوجي',
    missionDate: '2026-09-16',
    destination1: 'مدرسة النور الابتدائية',
    destination2: 'مدرسة الأمل النموذجية',
    destination3: '',
    companion1: 'ذة. سميرة الداودي',
    companion2: 'ذ. رشيد العماري',
    companion3: '',
    notes: 'تتبع سير تقويم التعلمات والاطلاع على دفاتر النصوص والتجهيزات.',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'm-103',
    inspectorName: 'ذ. محمد بناني',
    rentalNumber: '894210',
    missionType: 'بحث إداري ومعاينة ميدانية',
    missionDate: '2026-09-17',
    destination1: 'المديرية الإقليمية',
    destination2: 'مركز التوجيه والإرشاد التربوي',
    destination3: '',
    companion1: 'ذ. عبد الله المرابط',
    companion2: '',
    companion3: '',
    notes: 'معاينة مرافق المؤسسة والتدبير الإداري ومقابلة الطاقم الإداري.',
    status: 'in_progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'm-104',
    inspectorName: 'ذ. حسن الودغيري',
    rentalNumber: '954120',
    missionType: 'تدبير مالي ومادي وتفقد مرافق',
    missionDate: '2026-09-19',
    destination1: 'ثانوية طارق بن زياد',
    destination2: 'داخلية الإمام مالك',
    destination3: 'المركز الجهوي للتكوين المستمر',
    companion1: 'ذ. هشام الصقلي',
    companion2: 'ذ. ياسين الزيات',
    companion3: 'ذة. خديجة أمين',
    notes: 'مهمة مبرمجة لمراجعة سجلات المحاسبة المادية والتموينات.',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

function loadMissions(): Mission[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_MISSIONS, null, 2), 'utf-8');
      return INITIAL_MISSIONS;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : INITIAL_MISSIONS;
  } catch (err) {
    console.error('Error loading missions data, using initial dataset:', err);
    return INITIAL_MISSIONS;
  }
}

function saveMissions(missions: Mission[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(missions, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving missions to disk:', err);
    return false;
  }
}

let missionsStore: Mission[] = loadMissions();

// Active SSE Connections for instant cross-device live sync
const sseClients = new Set<express.Response>();

function broadcastSync(action: string, payload: any) {
  const message = JSON.stringify({
    action,
    payload,
    timestamp: new Date().toISOString(),
  });
  for (const client of sseClients) {
    try {
      client.write(`data: ${message}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Request logger for troubleshooting
  app.use((req, res, next) => {
    res.on('finish', () => {
      if (res.statusCode === 404) {
        console.warn(`[404 NOT FOUND] ${req.method} ${req.originalUrl}`);
      }
    });
    next();
  });

  app.use(express.json({ limit: '10mb' }));

  // Serve static assets from public/ directory
  const publicDir = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
  }

  // Explicit handlers for browser icons and metadata to guarantee 0 404 errors
  app.get(['/favicon.ico', '/favicon.svg'], (_req, res) => {
    const svgPath = path.join(publicDir, 'favicon.svg');
    const icoPath = path.join(publicDir, 'favicon.ico');
    if (fs.existsSync(svgPath)) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.sendFile(svgPath);
    } else if (fs.existsSync(icoPath)) {
      res.setHeader('Content-Type', 'image/x-icon');
      res.sendFile(icoPath);
    } else {
      res.status(204).end();
    }
  });

  app.get(
    [
      '/apple-touch-icon*.png',
      '/favicon*.png',
      '/icon-*.png',
      '/logo*.png',
      '/apple-touch-icon-precomposed.png',
    ],
    (req, res) => {
      const fileName = path.basename(req.path);
      const filePath = path.join(publicDir, fileName);
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'image/png');
        res.sendFile(filePath);
      } else {
        const defaultIcon = path.join(publicDir, 'apple-touch-icon.png');
        if (fs.existsSync(defaultIcon)) {
          res.setHeader('Content-Type', 'image/png');
          res.sendFile(defaultIcon);
        } else {
          res.status(204).end();
        }
      }
    }
  );

  app.get(['/manifest.json', '/site.webmanifest', '/manifest.webmanifest'], (_req, res) => {
    const manifestPath = path.join(publicDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      res.setHeader('Content-Type', 'application/manifest+json');
      res.sendFile(manifestPath);
    } else {
      res.json({});
    }
  });

  app.get(['/sw.js', '/service-worker.js'], (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send('self.addEventListener("install", () => self.skipWaiting());\nself.addEventListener("activate", () => self.clients.claim());\n');
  });

  app.get('/browserconfig.xml', (_req, res) => {
    res.setHeader('Content-Type', 'application/xml');
    res.send('<?xml version="1.0" encoding="utf-8"?><browserconfig><msapplication><tile></tile></msapplication></browserconfig>');
  });

  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send('User-agent: *\nAllow: /\n');
  });

  // Sourcemap handler to eliminate browser devtools 404 warnings
  app.get('*.map', (_req, res) => {
    res.status(200).json({ version: 3, sources: [], mappings: '' });
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      totalMissions: missionsStore.length,
      connectedDevices: sseClients.size,
      time: new Date().toISOString(),
    });
  });

  // Real-time Server-Sent Events stream for instant cross-device synchronization
  app.get('/api/sync/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial handshake
    res.write(`data: ${JSON.stringify({ action: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // GET all missions
  app.get('/api/missions', (_req, res) => {
    res.json({
      success: true,
      missions: missionsStore,
      serverTime: new Date().toISOString(),
    });
  });

  // POST create new mission
  app.post('/api/missions', (req, res) => {
    const body = req.body;
    if (!body.inspectorName || !body.rentalNumber || !body.missionType || !body.missionDate || !body.destination1) {
      res.status(400).json({
        success: false,
        error: 'الحقول الأساسية مطلوبة (إسم المفتش، رقم التأجير، نوع المهمة، التاريخ، الاتجاه 1)',
      });
      return;
    }

    const now = new Date().toISOString();
    const newMission: Mission = {
      id: body.id || `m-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      inspectorName: String(body.inspectorName).trim(),
      rentalNumber: String(body.rentalNumber).trim(),
      missionType: String(body.missionType).trim(),
      missionDate: String(body.missionDate).trim(),
      destination1: String(body.destination1).trim(),
      destination2: body.destination2 ? String(body.destination2).trim() : '',
      destination3: body.destination3 ? String(body.destination3).trim() : '',
      companion1: body.companion1 ? String(body.companion1).trim() : '',
      companion2: body.companion2 ? String(body.companion2).trim() : '',
      companion3: body.companion3 ? String(body.companion3).trim() : '',
      notes: body.notes ? String(body.notes).trim() : '',
      status: body.status || 'scheduled',
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    // Prepend new mission so it shows at the top
    missionsStore = [newMission, ...missionsStore.filter(m => m.id !== newMission.id)];
    saveMissions(missionsStore);

    // Broadcast in real-time to all other devices (phone, PC, tablets)
    broadcastSync('create', newMission);

    res.status(201).json({
      success: true,
      mission: newMission,
    });
  });

  // PUT update mission
  app.put('/api/missions/:id', (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const index = missionsStore.findIndex(m => m.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, error: 'المهمة غير موجودة' });
      return;
    }

    const existing = missionsStore[index];
    const updatedMission: Mission = {
      ...existing,
      inspectorName: body.inspectorName !== undefined ? String(body.inspectorName).trim() : existing.inspectorName,
      rentalNumber: body.rentalNumber !== undefined ? String(body.rentalNumber).trim() : existing.rentalNumber,
      missionType: body.missionType !== undefined ? String(body.missionType).trim() : existing.missionType,
      missionDate: body.missionDate !== undefined ? String(body.missionDate).trim() : existing.missionDate,
      destination1: body.destination1 !== undefined ? String(body.destination1).trim() : existing.destination1,
      destination2: body.destination2 !== undefined ? String(body.destination2).trim() : existing.destination2,
      destination3: body.destination3 !== undefined ? String(body.destination3).trim() : existing.destination3,
      companion1: body.companion1 !== undefined ? String(body.companion1).trim() : existing.companion1,
      companion2: body.companion2 !== undefined ? String(body.companion2).trim() : existing.companion2,
      companion3: body.companion3 !== undefined ? String(body.companion3).trim() : existing.companion3,
      notes: body.notes !== undefined ? String(body.notes).trim() : existing.notes,
      status: body.status !== undefined ? body.status : existing.status,
      updatedAt: new Date().toISOString(),
    };

    missionsStore[index] = updatedMission;
    saveMissions(missionsStore);

    // Live broadcast update to all connected devices
    broadcastSync('update', updatedMission);

    res.json({
      success: true,
      mission: updatedMission,
    });
  });

  // DELETE mission
  app.delete('/api/missions/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = missionsStore.length;
    missionsStore = missionsStore.filter(m => m.id !== id);

    if (missionsStore.length === initialLen) {
      res.status(404).json({ success: false, error: 'المهمة غير موجودة' });
      return;
    }

    saveMissions(missionsStore);
    broadcastSync('delete', { id });

    res.json({ success: true, deletedId: id });
  });

  // Bulk sync / Import endpoint
  app.post('/api/missions/bulk', (req, res) => {
    const { missions, mode } = req.body;
    if (!Array.isArray(missions)) {
      res.status(400).json({ success: false, error: 'تنسيق البيانات غير صحيح' });
      return;
    }

    if (mode === 'replace') {
      missionsStore = missions;
    } else {
      // Merge by ID or append
      const existingMap = new Map(missionsStore.map(m => [m.id, m]));
      for (const m of missions) {
        existingMap.set(m.id, m);
      }
      missionsStore = Array.from(existingMap.values());
    }

    saveMissions(missionsStore);
    broadcastSync('bulk', missionsStore);

    res.json({
      success: true,
      count: missionsStore.length,
      missions: missionsStore,
    });
  });

  // ==========================================
  // GitHub Integration Endpoints & Upload Logic
  // ==========================================
  let githubToken = process.env.GITHUB_TOKEN || '';

  // Generic GitHub API helper
  async function githubApi(endpoint: string, options: { method?: string; body?: any; token?: string } = {}) {
    const tokenToUse = (options.token || githubToken || '').trim();
    if (!tokenToUse) {
      throw new Error('يرجى إدخال رمز الوصول الشخصي (Personal Access Token) الخاص بحسابك على GitHub');
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${tokenToUse}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Inspector-Missions-App/1.0',
    };
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`https://api.github.com${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = data?.message || `GitHub error (${res.status})`;
      throw new Error(msg);
    }
    return data;
  }

  // Scan and gather project files for push
  function getProjectFilesForPush(): { path: string; content: string }[] {
    const rootDir = process.cwd();
    const filesList: { path: string; content: string }[] = [];
    const ignoredDirs = new Set(['node_modules', '.git', 'dist', 'build', '.cache', '.turbo']);
    const ignoredFiles = new Set(['.DS_Store', 'server.js']);

    function walk(dir: string, prefix = '') {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (ignoredDirs.has(item.name) || ignoredFiles.has(item.name)) continue;
        if (item.name === '.env') continue; // Don't push local secret .env

        const fullPath = path.join(dir, item.name);
        const relPath = prefix ? `${prefix}/${item.name}` : item.name;

        if (item.isDirectory()) {
          walk(fullPath, relPath);
        } else if (item.isFile()) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            filesList.push({ path: relPath, content });
          } catch (e) {
            // Ignore unreadable or binary files
          }
        }
      }
    }

    walk(rootDir);
    return filesList;
  }

  // 1. Check GitHub connection status
  app.get('/api/github/status', async (_req, res) => {
    if (!githubToken) {
      res.json({
        connected: false,
        user: null,
        hasEnvToken: Boolean(process.env.GITHUB_TOKEN),
      });
      return;
    }

    try {
      const user = await githubApi('/user');
      res.json({
        connected: true,
        user: {
          login: user.login,
          name: user.name,
          avatar_url: user.avatar_url,
          html_url: user.html_url,
          public_repos: user.public_repos,
          total_private_repos: user.total_private_repos || 0,
          bio: user.bio,
        },
        hasEnvToken: Boolean(process.env.GITHUB_TOKEN),
      });
    } catch (err: any) {
      res.json({
        connected: false,
        user: null,
        error: err.message,
        hasEnvToken: Boolean(process.env.GITHUB_TOKEN),
      });
    }
  });

  // 2. Connect GitHub Token
  app.post('/api/github/connect', async (req, res) => {
    const { token } = req.body;
    if (!token || typeof token !== 'string' || !token.trim()) {
      res.status(400).json({ success: false, error: 'الرمز السري (Token) مطلوب للاتصال بـ GitHub' });
      return;
    }

    try {
      const user = await githubApi('/user', { token: token.trim() });
      githubToken = token.trim();
      res.json({
        success: true,
        user: {
          login: user.login,
          name: user.name,
          avatar_url: user.avatar_url,
          html_url: user.html_url,
          public_repos: user.public_repos,
          total_private_repos: user.total_private_repos || 0,
          bio: user.bio,
        },
      });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        error: `فشل الاتصال بحساب GitHub: ${err.message}. تأكد من صحة الرمز ومنح صلاحية 'repo'.`,
      });
    }
  });

  // 3. Disconnect GitHub
  app.post('/api/github/disconnect', (_req, res) => {
    githubToken = '';
    res.json({ success: true, message: 'تم قطع الاتصال بـ GitHub بنجاح' });
  });

  // 4. List User Repositories
  app.get('/api/github/repos', async (_req, res) => {
    try {
      const repos = await githubApi('/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator');
      const simplified = repos.map((r: any) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        private: r.private,
        html_url: r.html_url,
        default_branch: r.default_branch || 'main',
        description: r.description,
        updated_at: r.updated_at,
      }));
      res.json({ success: true, repos: simplified });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Create a new repository on user's GitHub
  app.post('/api/github/create-repo', async (req, res) => {
    const { name, description, isPrivate } = req.body;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ success: false, error: 'اسم المستودع مطلوب' });
      return;
    }

    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9-_.]/g, '-');

    try {
      const newRepo = await githubApi('/user/repos', {
        method: 'POST',
        body: {
          name: cleanName,
          description: description || 'نظام تدبير وتوثيق مهام التفتيش والمراقبة التربوية',
          private: Boolean(isPrivate),
          auto_init: true,
        },
      });

      res.status(201).json({
        success: true,
        repo: {
          id: newRepo.id,
          name: newRepo.name,
          full_name: newRepo.full_name,
          private: newRepo.private,
          html_url: newRepo.html_url,
          default_branch: newRepo.default_branch || 'main',
          description: newRepo.description,
          updated_at: newRepo.updated_at,
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: `تعذر إنشاء المستودع: ${err.message}` });
    }
  });

  // 6. Push Full Project Codebase to GitHub
  app.post('/api/github/push-project', async (req, res) => {
    const { owner, repo, branch = 'main', commitMessage } = req.body;
    if (!owner || !repo) {
      res.status(400).json({ success: false, error: 'يرجى تحديد مالك واسم المستودع' });
      return;
    }

    try {
      const files = getProjectFilesForPush();
      if (files.length === 0) {
        res.status(400).json({ success: false, error: 'لا توجد ملفات لرفعها' });
        return;
      }

      // Step A: Check target branch / repository ref
      let latestCommitSha: string | null = null;
      let baseTreeSha: string | null = null;

      try {
        const refData = await githubApi(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
        latestCommitSha = refData?.object?.sha || null;
        if (latestCommitSha) {
          const commitData = await githubApi(`/repos/${owner}/${repo}/git/commits/${latestCommitSha}`);
          baseTreeSha = commitData?.tree?.sha || null;
        }
      } catch {
        // Branch might not exist yet or repo is empty
      }

      // If empty repo without commits, initialize with README first
      if (!latestCommitSha) {
        try {
          const readmeContent = Buffer.from(
            '# نظام تدبير مهام التفتيش والمراقبة\n\nتطبيق سحابي لتدبير وتوثيق مهام التفتيش والمراقبة.\n'
          ).toString('base64');
          await githubApi(`/repos/${owner}/${repo}/contents/README.md`, {
            method: 'PUT',
            body: {
              message: 'Initial repository setup',
              content: readmeContent,
              branch,
            },
          });
          // Retrieve the initial commit
          const refData = await githubApi(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
          latestCommitSha = refData?.object?.sha || null;
          if (latestCommitSha) {
            const commitData = await githubApi(`/repos/${owner}/${repo}/git/commits/${latestCommitSha}`);
            baseTreeSha = commitData?.tree?.sha || null;
          }
        } catch (initErr) {
          console.warn('Note on repo initialization:', initErr);
        }
      }

      // Step B: Create Blobs for each file in parallel chunks
      const treeItems: Array<{ path: string; mode: string; type: string; sha: string }> = [];
      const CHUNK_SIZE = 8;
      for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        const chunk = files.slice(i, i + CHUNK_SIZE);
        const results = await Promise.all(
          chunk.map(async (file) => {
            const blobData = await githubApi(`/repos/${owner}/${repo}/git/blobs`, {
              method: 'POST',
              body: {
                content: file.content,
                encoding: 'utf-8',
              },
            });
            return {
              path: file.path,
              mode: '100644',
              type: 'blob',
              sha: blobData.sha,
            };
          })
        );
        treeItems.push(...results);
      }

      // Step C: Create Git Tree
      const treePayload: any = { tree: treeItems };
      if (baseTreeSha) {
        treePayload.base_tree = baseTreeSha;
      }
      const newTree = await githubApi(`/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        body: treePayload,
      });

      // Step D: Create Commit
      const finalMsg = commitMessage || `تحديث ملفات نظام مهام التفتيش والمراقبة (${new Date().toLocaleString('ar-MA')})`;
      const commitPayload: any = {
        message: finalMsg,
        tree: newTree.sha,
        parents: latestCommitSha ? [latestCommitSha] : [],
      };
      const newCommit = await githubApi(`/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        body: commitPayload,
      });

      // Step E: Update or Create Git Ref
      try {
        await githubApi(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
          method: 'PATCH',
          body: {
            sha: newCommit.sha,
            force: true,
          },
        });
      } catch {
        await githubApi(`/repos/${owner}/${repo}/git/refs`, {
          method: 'POST',
          body: {
            ref: `refs/heads/${branch}`,
            sha: newCommit.sha,
          },
        });
      }

      res.json({
        success: true,
        commitSha: newCommit.sha,
        commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
        repoUrl: `https://github.com/${owner}/${repo}`,
        filesCount: files.length,
        message: `تم رفع ${files.length} ملف بنجاح إلى المستودع على GitHub!`,
      });
    } catch (err: any) {
      console.error('Error pushing project to GitHub:', err);
      res.status(500).json({
        success: false,
        error: `فشل رفع المشروع إلى GitHub: ${err.message}`,
      });
    }
  });

  // 7. Push Missions Data & Reports only
  app.post('/api/github/push-data', async (req, res) => {
    const { owner, repo, branch = 'main', commitMessage } = req.body;
    if (!owner || !repo) {
      res.status(400).json({ success: false, error: 'يرجى تحديد المستودع' });
      return;
    }

    try {
      const missionsJson = JSON.stringify(missionsStore, null, 2);
      
      // Auto-generate a Markdown report
      const reportLines = [
        '# تقرير وسجل مهام التفتيش والمراقبة',
        `> تم التحديث تلقائياً في: ${new Date().toLocaleString('ar-MA')}`,
        '',
        `### إحصائيات سريعة:`,
        `- **إجمالي المهام:** ${missionsStore.length}`,
        `- **المهام المنجزة:** ${missionsStore.filter(m => m.status === 'completed').length}`,
        `- **المهام الجارية:** ${missionsStore.filter(m => m.status === 'in_progress').length}`,
        `- **المهام المبرمجة:** ${missionsStore.filter(m => m.status === 'scheduled').length}`,
        '',
        '### جدول المهام:',
        '| التاريخ | المفتش | رقم التأجير | نوع المهمة | الاتجاه 1 | المرافق 1 | الحالة |',
        '| :--- | :--- | :--- | :--- | :--- | :--- | :--- |',
        ...missionsStore.map(m => {
          const statusTxt = m.status === 'completed' ? 'منجزة' : m.status === 'in_progress' ? 'جارية' : 'مبرمجة';
          return `| ${m.missionDate} | ${m.inspectorName} | ${m.rentalNumber} | ${m.missionType} | ${m.destination1} | ${m.companion1 || '-'} | ${statusTxt} |`;
        }),
        '',
      ];
      const markdownReport = reportLines.join('\n');

      const filesToPush = [
        { path: 'data/missions.json', content: missionsJson },
        { path: 'REPORTS/missions-summary.md', content: markdownReport },
      ];

      // Upload files via contents or git blobs
      let latestCommitSha: string | null = null;
      let baseTreeSha: string | null = null;

      try {
        const refData = await githubApi(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
        latestCommitSha = refData?.object?.sha || null;
        if (latestCommitSha) {
          const commitData = await githubApi(`/repos/${owner}/${repo}/git/commits/${latestCommitSha}`);
          baseTreeSha = commitData?.tree?.sha || null;
        }
      } catch (e) {
        // ref might not exist
      }

      const treeItems = await Promise.all(
        filesToPush.map(async (f) => {
          const blobData = await githubApi(`/repos/${owner}/${repo}/git/blobs`, {
            method: 'POST',
            body: { content: f.content, encoding: 'utf-8' },
          });
          return {
            path: f.path,
            mode: '100644',
            type: 'blob',
            sha: blobData.sha,
          };
        })
      );

      const treePayload: any = { tree: treeItems };
      if (baseTreeSha) treePayload.base_tree = baseTreeSha;

      const newTree = await githubApi(`/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        body: treePayload,
      });

      const finalMsg = commitMessage || `مزامنة وحفظ بيانات المهام والتقارير (${new Date().toLocaleString('ar-MA')})`;
      const newCommit = await githubApi(`/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        body: {
          message: finalMsg,
          tree: newTree.sha,
          parents: latestCommitSha ? [latestCommitSha] : [],
        },
      });

      await githubApi(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        body: { sha: newCommit.sha, force: true },
      });

      res.json({
        success: true,
        commitSha: newCommit.sha,
        commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
        repoUrl: `https://github.com/${owner}/${repo}`,
        filesCount: filesToPush.length,
        message: 'تم حفظ ومزامنة قاعدة بيانات المهام والتقارير إلى GitHub بنجاح!',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: `فشل رفع البيانات: ${err.message}` });
    }
  });

  // Vite middleware in dev, Static in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback in dev for non-Vite intercepted requests
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api/')) {
        return res.status(404).json({ success: false, error: 'Endpoint not found' });
      }
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server startup error:', err);
});
