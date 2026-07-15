import React from 'react';
import {
  Code2, Copy, CheckCircle2, AlertCircle, Save, RotateCcw, Loader2,
  FileCode2, RefreshCw, Rocket, Shield, Zap, BookOpen, Terminal,
  Webhook, MousePointerClick, FormInput, Search, Eye, Server,
} from 'lucide-react';
import { useProject } from '../App';

const API_BASE = 'https://api1-orpin.vercel.app/api/custom';

type Tab = 'overview' | 'install' | 'editor' | 'events' | 'privacy';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'install', label: 'Installation', icon: Rocket },
  { id: 'editor', label: 'Script Editor', icon: FileCode2 },
  { id: 'events', label: 'Custom Events', icon: Webhook },
  { id: 'privacy', label: 'Privacy & Performance', icon: Shield },
];

function Documentation() {
  const [activeTab, setActiveTab] = React.useState<Tab>('overview');
  const [copied, setCopied] = React.useState<string | null>(null);
  const { selectedProject } = useProject();

  // Script editor state
  const [scriptContent, setScriptContent] = React.useState('');
  const [originalContent, setOriginalContent] = React.useState('');
  const [loadingScript, setLoadingScript] = React.useState(false);
  const [savingScript, setSavingScript] = React.useState(false);
  const [resettingScript, setResettingScript] = React.useState(false);
  const [scriptError, setScriptError] = React.useState<string | null>(null);
  const [scriptSuccess, setScriptSuccess] = React.useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = React.useState<string | null>(null);
  const lastLoadedProjectRef = React.useRef<string | null>(null);

  const projectId = selectedProject?.id || 'YOUR_PROJECT_ID';

  const installSnippet = `<!-- Single tag — rrweb and project ID are auto-detected -->
<script src="${API_BASE}/${projectId}/tracking.js" defer></script>`;

  const fetchScript = React.useCallback(async (pId: string) => {
    setLoadingScript(true);
    setScriptError(null);
    setScriptSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/${pId}/tracking-script`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setScriptContent(data.scriptContent || '');
      setOriginalContent(data.scriptContent || '');
      setUpdatedAt(data.updatedAt || null);
      lastLoadedProjectRef.current = pId;
    } catch (err: any) {
      setScriptError(err.message || 'Failed to fetch tracking script');
    } finally {
      setLoadingScript(false);
    }
  }, []);

  React.useEffect(() => {
    if (selectedProject?.id && selectedProject.id !== lastLoadedProjectRef.current) {
      fetchScript(selectedProject.id);
    }
  }, [selectedProject?.id, fetchScript]);

  const handleSaveScript = async () => {
    if (!selectedProject) return;
    setSavingScript(true);
    setScriptError(null);
    setScriptSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/${selectedProject.id}/tracking-script`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptContent }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setOriginalContent(scriptContent);
      setScriptSuccess('Script pushed live successfully.');
      setTimeout(() => setScriptSuccess(null), 4000);
    } catch (err: any) {
      setScriptError(err.message || 'Failed to save tracking script');
    } finally {
      setSavingScript(false);
    }
  };

  const handleResetScript = async () => {
    if (!selectedProject) return;
    if (!confirm('Reset the tracking script to the default template? Your custom changes will be lost.')) return;
    setResettingScript(true);
    setScriptError(null);
    setScriptSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/${selectedProject.id}/tracking-script/reset`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setScriptContent(data.scriptContent || '');
      setOriginalContent(data.scriptContent || '');
      setScriptSuccess('Script reset to default template.');
      setTimeout(() => setScriptSuccess(null), 4000);
    } catch (err: any) {
      setScriptError(err.message || 'Failed to reset tracking script');
    } finally {
      setResettingScript(false);
    }
  };

  const hasChanges = scriptContent !== originalContent;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Terminal className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-400 dark:text-gray-500 uppercase tracking-wider">Developer Docs</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Analytics Implementation</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-2 max-w-2xl">
            Everything you need to install tracking, customize the script, and start collecting analytics from your website.
          </p>

          {/* Project status badge */}
          <div className="mt-5">
            {selectedProject ? (
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-blue-800 dark:text-blue-400 font-medium">{selectedProject.name}</span>
                <span className="text-xs text-blue-400 dark:text-blue-500">·</span>
                <code className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">{selectedProject.id}</code>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full px-4 py-1.5">
                <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">No project selected — select one from the sidebar</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="flex gap-1 overflow-x-auto -mb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    active
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:border-slate-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10">
        {/* ───────────── Overview ───────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: Rocket, title: '1. Create a Project', desc: 'Go to the Projects page and create a new project to get your unique Project ID.' },
                { icon: Code2, title: '2. Install Tracking', desc: 'Add a single script tag to your HTML <head>. The project ID is auto-detected from the URL and rrweb is auto-loaded.' },
                { icon: Eye, title: '3. View Analytics', desc: 'Visit your dashboard to see real-time visitors, events, session recordings, and more.' },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-1.5">{step.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Ready to integrate?</h3>
                  <p className="text-blue-100 text-sm mb-4 max-w-xl">
                    Jump to the Installation tab for the copy-paste snippet, or open the Script Editor to customize your tracking script.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveTab('install')}
                      className="px-4 py-2 bg-white text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                    >
                      View Installation
                    </button>
                    <button
                      onClick={() => setActiveTab('editor')}
                      className="px-4 py-2 bg-white/15 text-white rounded-lg text-sm font-medium hover:bg-white/25 transition-colors"
                    >
                      Open Script Editor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───────────── Installation ───────────── */}
        {activeTab === 'install' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Install the Tracking Script</h2>
              <p className="text-slate-500 dark:text-gray-400">
                Add this single tag to the <code className="bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">&lt;head&gt;</code> of every page you want to track. The server injects the project ID into the script automatically — no extra config needed.
              </p>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-medium">1</div>
                  <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Copy this snippet</span>
                </div>
                <button
                  onClick={() => copyToClipboard(installSnippet, 'install')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-slate-600 dark:text-gray-300"
                >
                  {copied === 'install' ? <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" /> : <Copy className="h-4 w-4" />}
                  {copied === 'install' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-slate-900 rounded-xl overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-slate-400 font-mono">index.html</span>
                </div>
                <pre className="p-5 text-sm text-slate-100 font-mono overflow-x-auto leading-relaxed">{installSnippet}</pre>
              </div>
            </div>

            <div className="grid sm:grid-cols-1 gap-4">
              {[
                { num: '1', label: 'Load Tracking Script', desc: 'Single tag — the server injects the project ID and rrweb is auto-loaded. Fully customizable.' },
              ].map((s) => (
                <div key={s.num} className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-semibold mb-3">{s.num}</div>
                  <h4 className="font-medium text-slate-800 dark:text-white text-sm mb-1">{s.label}</h4>
                  <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400 p-4 rounded-xl">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm space-y-1">
                <p className="font-medium">Heads up</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-700 dark:text-blue-400">
                  <li>Replace <code className="bg-blue-100 dark:bg-blue-950/60 px-1 rounded">YOUR_PROJECT_ID</code> in the script URL with your actual project ID</li>
                  <li>rrweb is auto-loaded by the tracking script — no need to include it separately</li>
                  <li>The server injects the project ID into the script — no need to set <code className="bg-blue-100 dark:bg-blue-950/60 px-1 rounded">window.ANALYTICS_PROJECT_ID</code></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ───────────── Script Editor ───────────── */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Custom Tracking Script Editor</h2>
              <p className="text-slate-500 dark:text-gray-400">
                Each project has its own tracking script. Edit the code below and push to make changes live instantly —
                the updated script is served at <code className="bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">/api/custom/{'{projectId}'}/tracking.js</code>.
              </p>
            </div>

            {!selectedProject ? (
              <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 p-6 rounded-xl">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">Select a project from the sidebar to manage its custom tracking script.</p>
              </div>
            ) : (
              <>
                {/* Script URL card */}
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3">
                  <Server className="h-5 w-5 text-slate-400 dark:text-gray-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 dark:text-gray-400 mb-0.5">Live Script URL</p>
                    <code className="text-xs text-blue-600 dark:text-blue-400 break-all">{API_BASE}/{selectedProject.id}/tracking.js</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`${API_BASE}/${selectedProject.id}/tracking.js`, 'url')}
                    className="flex-shrink-0 p-2 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {copied === 'url' ? <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" /> : <Copy className="h-4 w-4 text-slate-500 dark:text-gray-400" />}
                  </button>
                </div>

                {/* Status messages */}
                {scriptError && (
                  <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{scriptError}</p>
                  </div>
                )}
                {scriptSuccess && (
                  <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded-xl">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{scriptSuccess}</p>
                  </div>
                )}

                {/* Action bar */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleSaveScript}
                    disabled={savingScript || !hasChanges}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {savingScript ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {savingScript ? 'Pushing...' : 'Push Script'}
                  </button>
                  <button
                    onClick={handleResetScript}
                    disabled={resettingScript}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
                  >
                    {resettingScript ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                    Reset to Default
                  </button>
                  <button
                    onClick={() => fetchScript(selectedProject.id)}
                    disabled={loadingScript}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
                  >
                    {loadingScript ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Reload
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    {hasChanges ? (
                      <span className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        Unsaved changes
                      </span>
                    ) : updatedAt ? (
                      <span className="text-sm text-slate-400 dark:text-gray-500">Last updated {new Date(updatedAt).toLocaleString()}</span>
                    ) : null}
                  </div>
                </div>

                {/* Code editor */}
                <div className="bg-slate-900 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-700">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="ml-2 text-xs text-slate-400 font-mono">tracking.js</span>
                  </div>
                  {loadingScript ? (
                    <div className="flex items-center justify-center h-96">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                    </div>
                  ) : (
                    <textarea
                      value={scriptContent}
                      onChange={(e) => setScriptContent(e.target.value)}
                      spellCheck={false}
                      className="w-full h-96 bg-slate-900 text-slate-100 p-5 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/50 leading-relaxed dark:bg-gray-800"
                      placeholder="Loading tracking script..."
                    />
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ───────────── Custom Events ───────────── */}
        {activeTab === 'events' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Track Custom Events</h2>
              <p className="text-slate-500 dark:text-gray-400">
                Use the global <code className="bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">trackEvent()</code> function to track custom events beyond the default pageviews and clicks.
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-700">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-slate-400 font-mono">example.js</span>
              </div>
              <pre className="p-5 text-sm text-slate-100 font-mono overflow-x-auto leading-relaxed">{`// Track a custom event with optional data
trackEvent('event_name', {
  category: 'category',
  label: 'label',
  value: 123
});`}</pre>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {[
                { icon: FormInput, title: 'Form Submissions', code: `trackEvent('form_submit', {\n  formId: 'contact',\n  success: true\n});` },
                { icon: Search, title: 'Feature Usage', code: `trackEvent('feature_used', {\n  feature: 'search',\n  query: 'shoes'\n});` },
                { icon: MousePointerClick, title: 'CTA Clicks', code: `trackEvent('cta_click', {\n  ctaId: 'signup-hero',\n  location: 'header'\n});` },
                { icon: Eye, title: 'Video Plays', code: `trackEvent('video_play', {\n  videoId: 'demo',\n  duration: 120\n});` },
              ].map((ex) => {
                const Icon = ex.icon;
                return (
                  <div key={ex.title} className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-medium text-slate-800 dark:text-white text-sm">{ex.title}</h4>
                    </div>
                    <pre className="text-xs text-slate-600 dark:text-gray-400 bg-slate-50 dark:bg-gray-800 p-3 rounded-lg font-mono overflow-x-auto">{ex.code}</pre>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ───────────── Privacy & Performance ───────────── */}
        {activeTab === 'privacy' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">Privacy</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'No personal information collected by default',
                    'Anonymous, randomly-generated visitor IDs',
                    'Data stored on your own server',
                    'No third-party data sharing',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-gray-400">
                      <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">Performance</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'Efficient event batching (10 events per batch)',
                    'Throttled mouse movement tracking',
                    'Optimized scroll event handling',
                    'Minimal network requests via deferred sending',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-gray-400">
                      <CheckCircle2 className="h-4 w-4 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-slate-800 dark:bg-gray-800 rounded-2xl p-8 text-white">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Data Storage</h3>
                  <p className="text-slate-300 dark:text-gray-300 text-sm max-w-xl leading-relaxed">
                    All analytics data — events, sessions, and visitor records — is stored in your own database.
                    The custom tracking script is also stored per-project, so you have full control over what gets
                    collected and how it's sent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Documentation;
