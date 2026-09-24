import React, { useState, useEffect } from 'react';
import {
  Github,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Plus,
  FolderGit2,
  FileCode2,
  Database,
  Terminal,
  Copy,
  Check,
  Eye,
  EyeOff,
  LogOut,
  Lock,
  Globe,
  ArrowUpRight,
} from 'lucide-react';
import {
  GitHubUser,
  GitHubRepo,
  GitHubPushResult,
} from '../types';
import {
  fetchGitHubStatus,
  connectGitHub,
  disconnectGitHub,
  fetchGitHubRepos,
  createGitHubRepo,
  pushProjectToGitHub,
  pushDataToGitHub,
} from '../lib/api';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange?: (connected: boolean) => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({
  isOpen,
  onClose,
  onConnectionChange,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active tab: 'project' | 'data' | 'cli'
  const [activeTab, setActiveTab] = useState<'project' | 'data' | 'cli'>('project');

  // Push project form
  const [selectedRepoFullName, setSelectedRepoFullName] = useState<string>('');
  const [branch, setBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<GitHubPushResult | null>(null);

  // Create new repo form state
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [newRepoName, setNewRepoName] = useState('systeme-gestion-missions');
  const [newRepoDesc, setNewRepoDesc] = useState('نظام سحابي متكامل لتدبير وتوثيق مهام التفتيش والمراقبة');
  const [newRepoPrivate, setNewRepoPrivate] = useState(false);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);

  // Copy state for CLI
  const [copiedCli, setCopiedCli] = useState(false);

  // Load status when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
      setPushResult(null);
      checkStatus();
    }
  }, [isOpen]);

  const checkStatus = async () => {
    setIsLoadingStatus(true);
    setError(null);
    try {
      const status = await fetchGitHubStatus();
      setIsConnected(status.connected);
      setUser(status.user);
      onConnectionChange?.(status.connected);

      if (status.connected) {
        loadRepos();
      }
    } catch (e: any) {
      setError('تعذر التحقق من حالة الاتصال بـ GitHub');
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const loadRepos = async () => {
    setIsLoadingRepos(true);
    try {
      const list = await fetchGitHubRepos();
      setRepos(list);
      if (list.length > 0 && !selectedRepoFullName) {
        setSelectedRepoFullName(list[0].full_name);
      }
    } catch (e: any) {
      console.warn('Error loading repos:', e);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError('يرجى كتابة أو لصق رمز GitHub Personal Access Token');
      return;
    }

    setIsConnecting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await connectGitHub(tokenInput.trim());
      if (res.success && res.user) {
        setIsConnected(true);
        setUser(res.user);
        setTokenInput('');
        setSuccessMsg(`تم الاتصال بنجاح بحساب @${res.user.login}`);
        onConnectionChange?.(true);
        loadRepos();
      } else {
        setError(res.error || 'فشل الاتصال بحساب GitHub. تأكد من صحة الرمز.');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الاتصال');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    const ok = await disconnectGitHub();
    if (ok) {
      setIsConnected(false);
      setUser(null);
      setRepos([]);
      setSelectedRepoFullName('');
      setPushResult(null);
      setSuccessMsg('تم قطع الاتصال بـ GitHub');
      onConnectionChange?.(false);
    }
  };

  const handleCreateNewRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoName.trim()) {
      setError('اسم المستودع مطلوب');
      return;
    }

    setIsCreatingRepo(true);
    setError(null);
    try {
      const res = await createGitHubRepo(newRepoName.trim(), newRepoDesc.trim(), newRepoPrivate);
      if (res.success && res.repo) {
        setShowCreateRepo(false);
        setSuccessMsg(`تم إنشاء المستودع "${res.repo.name}" بنجاح على GitHub!`);
        // Refresh repos
        await loadRepos();
        setSelectedRepoFullName(res.repo.full_name);
      } else {
        setError(res.error || 'تعذر إنشاء المستودع');
      }
    } catch (err: any) {
      setError(err.message || 'خطأ أثناء إنشاء المستودع');
    } finally {
      setIsCreatingRepo(false);
    }
  };

  const handlePushProject = async () => {
    if (!selectedRepoFullName) {
      setError('يرجى اختيار مستودع أولاً أو إنشاء مستودع جديد');
      return;
    }

    const [owner, repo] = selectedRepoFullName.split('/');
    if (!owner || !repo) {
      setError('اسم المستودع غير صحيح');
      return;
    }

    setIsPushing(true);
    setError(null);
    setPushResult(null);

    try {
      const res = await pushProjectToGitHub({
        owner,
        repo,
        branch: branch.trim() || 'main',
        commitMessage: commitMessage.trim() || undefined,
      });

      setPushResult(res);
      if (res.success) {
        setSuccessMsg(res.message || 'تم رفع المشروع بنجاح إلى GitHub!');
        setCommitMessage('');
      } else {
        setError(res.error || 'فشل رفع المشروع إلى GitHub');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء رفع الملفات');
    } finally {
      setIsPushing(false);
    }
  };

  const handlePushDataOnly = async () => {
    if (!selectedRepoFullName) {
      setError('يرجى اختيار مستودع أولاً أو إنشاء مستودع جديد');
      return;
    }

    const [owner, repo] = selectedRepoFullName.split('/');
    setIsPushing(true);
    setError(null);
    setPushResult(null);

    try {
      const res = await pushDataToGitHub({
        owner,
        repo,
        branch: branch.trim() || 'main',
        commitMessage: commitMessage.trim() || undefined,
      });

      setPushResult(res);
      if (res.success) {
        setSuccessMsg(res.message || 'تم حفظ ومزامنة قاعدة البيانات إلى GitHub بنجاح!');
        setCommitMessage('');
      } else {
        setError(res.error || 'فشل رفع البيانات');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء رفع البيانات');
    } finally {
      setIsPushing(false);
    }
  };

  const getCliCommands = () => {
    const repoUrl = selectedRepoFullName
      ? `https://github.com/${selectedRepoFullName}.git`
      : 'https://github.com/<USERNAME>/<REPO_NAME>.git';

    return `# 1. تهيئة مستودع Git محلياً
git init

# 2. إضافة كافة ملفات المشروع
git add .

# 3. تسجيل الإيداع الأول
git commit -m "feat: Initial commit for Inspection Missions System"

# 4. تعيين الفرع الرئيسي
git branch -M main

# 5. ربط المستودع البعيد على GitHub
git remote add origin ${repoUrl}

# 6. دفع الشفرة إلى GitHub
git push -u origin main`;
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText(getCliCommands());
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ef0d0d] text-white flex items-center justify-center shadow-md">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>الاتصال بـ GitHub ورفع الملفات</span>
                {isConnected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    متصل
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                مزامنة شفرة المشروع وقاعدة بيانات المهام مباشرة مع مستودعاتك على GitHub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Notifications / Alerts */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          {/* Loading status */}
          {isLoadingStatus ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                جاري التحقق من الاتصال بـ GitHub...
              </p>
            </div>
          ) : !isConnected ? (
            /* ========================================================
               1. NOT CONNECTED: Connect Account Form
               ======================================================== */
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-850/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  الاتصال عبر رمز الوصول الشخصي (GitHub Personal Access Token)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  للتمكن من رفع شفرة المشروع وحفظ البيانات تلقائياً، يحتاج النظام إلى رمز وصول مؤمن بصلاحية <code>repo</code>.
                </p>
                
                {/* Steps in Arabic */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">طريقة إنشاء الرمز في 30 ثانية:</div>
                  <ol className="list-decimal list-inside space-y-1 pr-1">
                    <li>
                      افتح صفحة رموز GitHub مباشرة:{' '}
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo&description=InspectorMissionsApp"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold underline hover:opacity-80"
                      >
                        <span>إنشاء رمز جديد (Tokens Classic)</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </li>
                    <li>تأكد من تفعيل الصلاحية: <strong>repo</strong> (Full control of private repositories).</li>
                    <li>انقر على زر <strong>Generate token</strong> في الأسفل، ثم انسخ الرمز والصقه أدناه.</li>
                  </ol>
                </div>
              </div>

              <form onSubmit={handleConnect} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    رمز الوصول (GitHub Personal Access Token):
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      title={showToken ? 'إخفاء الرمز' : 'إظهار الرمز'}
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 bg-[#f25d0e] p-3 rounded-xl">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isConnecting || !tokenInput.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#ee1313] hover:bg-red-700 active:scale-95 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span className="bg-[#0d0000] px-1 rounded">جاري التحقق والاتصال...</span>
                      </>
                    ) : (
                      <>
                        <Github className="w-4 h-4 text-white" />
                        <span className="bg-[#0d0000] px-1 rounded">الاتصال بحساب GitHub</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ========================================================
               2. CONNECTED: Manage & Push to GitHub
               ======================================================== */
            <div className="space-y-5">
              {/* User Profile Bar */}
              {user && (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {user.name || user.login}
                        </span>
                        <a
                          href={user.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-0.5"
                          dir="ltr"
                        >
                          @{user.login}
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      </div>
                      <div className="text-2xs text-slate-500 dark:text-slate-400">
                        {user.public_repos} مستودع عام • {user.total_private_repos} مستودع خاص
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDisconnect}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                    title="قطع الاتصال بحساب GitHub"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>قطع الاتصال</span>
                  </button>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('project')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'project'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <FileCode2 className="w-4 h-4 text-emerald-600" />
                  <span>رفع شفرة المشروع بالكامل</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('data')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'data'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>حفظ ومزامنة قاعدة البيانات فقط</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cli')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'cli'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">أوامر الطرفية</span>
                </button>
              </div>

              {/* Repository Selector & New Repo creation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                    المستودع المستهدف على GitHub:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCreateRepo(!showCreateRepo)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إنشاء مستودع جديد مباشرة</span>
                  </button>
                </div>

                {/* Create New Repo Drawer */}
                {showCreateRepo && (
                  <form
                    onSubmit={handleCreateNewRepo}
                    className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <FolderGit2 className="w-4 h-4" />
                        إنشاء مستودع جديد على حسابك
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowCreateRepo(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                      >
                        إلغاء
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          اسم المستودع (Repository Name):
                        </label>
                        <input
                          type="text"
                          value={newRepoName}
                          onChange={(e) => setNewRepoName(e.target.value)}
                          placeholder="systeme-gestion-missions"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none"
                          dir="ltr"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          نوع المستودع:
                        </label>
                        <div className="flex items-center gap-3 pt-1 text-xs">
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="repoPrivacy"
                              checked={!newRepoPrivate}
                              onChange={() => setNewRepoPrivate(false)}
                            />
                            <Globe className="w-3.5 h-3.5 text-slate-500" />
                            <span>عام (Public)</span>
                          </label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="repoPrivacy"
                              checked={newRepoPrivate}
                              onChange={() => setNewRepoPrivate(true)}
                            />
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                            <span>خاص (Private)</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        الوصف (Description):
                      </label>
                      <input
                        type="text"
                        value={newRepoDesc}
                        onChange={(e) => setNewRepoDesc(e.target.value)}
                        placeholder="نظام تدبير وتوثيق مهام التفتيش والمراقبة"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={isCreatingRepo}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {isCreatingRepo ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-white" />
                        )}
                        <span>إنشاء المستودع وتحديده</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Repos Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedRepoFullName}
                    onChange={(e) => setSelectedRepoFullName(e.target.value)}
                    disabled={isLoadingRepos || repos.length === 0}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    dir="ltr"
                  >
                    {repos.length === 0 ? (
                      <option value="">لا توجد مستودعات متاحة حالياً</option>
                    ) : (
                      repos.map((r) => (
                        <option key={r.id} value={r.full_name}>
                          {r.full_name} {r.private ? '🔒 (خاص)' : '🌐 (عام)'}
                        </option>
                      ))
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={loadRepos}
                    disabled={isLoadingRepos}
                    className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    title="تحديث قائمة المستودعات"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingRepos ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Tab 1: Push Project */}
              {activeTab === 'project' && (
                <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        رسالة الإيداع (Commit Message):
                      </label>
                      <input
                        type="text"
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        placeholder="feat: تحديث ملفات نظام تدبير مهام التفتيش"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        الفرع (Branch):
                      </label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="main"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      الملفات التي سيتم رفعها تلقائياً:
                    </div>
                    <div>
                      شفرة React، المكونات (`src/components/*`)، الخادم (`server.ts`)، ملفات التهيئات (`package.json`, `vite.config.ts`)، التوثيق الكامل (`README.md`)، وقاعدة بيانات المهام الحالية.
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      إغلاق
                    </button>
                    <button
                      type="button"
                      onClick={handlePushProject}
                      disabled={isPushing || !selectedRepoFullName}
                      style={{ backgroundColor: '#cb2d2d' }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#cb2d2d] hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-700/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isPushing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>جاري رفع ملفات المشروع إلى GitHub...</span>
                        </>
                      ) : (
                        <>
                          <FileCode2 className="w-4 h-4 text-white" />
                          <span>رفع المشروع بالكامل الآن</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Push Data Only */}
              {activeTab === 'data' && (
                <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    حفظ سريع للبيانات: يقوم هذا الخيار برفع وتحديث ملف <code>data/missions.json</code> مع إنشاء تقرير منسق بصيغة Markdown بجدول كافة المهام داخل مجلد <code>REPORTS/missions-summary.md</code> في المستودع.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        رسالة الإيداع:
                      </label>
                      <input
                        type="text"
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        placeholder="sync: حفظ ومزامنة قاعدة بيانات المهام والتقارير"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        الفرع:
                      </label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="main"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      إغلاق
                    </button>
                    <button
                      type="button"
                      onClick={handlePushDataOnly}
                      disabled={isPushing || !selectedRepoFullName}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all shadow-md shadow-blue-700/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isPushing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>جاري رفع ومزامنة البيانات...</span>
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4 text-white" />
                          <span>حفظ ومزامنة البيانات إلى GitHub</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Terminal CLI Instructions */}
              {activeTab === 'cli' && (
                <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      إذا كنت تفضل استخدام سطر الأوامر (Terminal)، يمكنك نسخ هذه الأوامر وتشغيلها في مجلد مشروعك:
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyCli}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedCli ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>نسخ الأوامر</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre
                    className="p-4 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800"
                    dir="ltr"
                  >
                    {getCliCommands()}
                  </pre>
                </div>
              )}

              {/* Push Result Banner */}
              {pushResult && pushResult.success && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{pushResult.message || 'تم الرفع بنجاح إلى GitHub!'}</span>
                    </div>
                    {pushResult.commitSha && (
                      <div className="text-2xs text-emerald-700 dark:text-emerald-400 font-mono mt-0.5" dir="ltr">
                        Commit: {pushResult.commitSha.substring(0, 7)}
                      </div>
                    )}
                  </div>

                  {pushResult.repoUrl && (
                    <a
                      href={pushResult.commitUrl || pushResult.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shrink-0 shadow-xs"
                    >
                      <span>عرض على GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
