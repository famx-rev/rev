import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Analytics from './pages/Analytics';
import Documentation from './pages/Documentation';
import Events from './pages/Events';
import Sessions from './pages/Sessions';
import Visitors from './pages/Visitors';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Landing from './pages/Landing';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ThemeProvider, useTheme, ThemeMode } from './auth/ThemeContext';
import { LayoutDashboard, FileText, List, Video, FolderOpen, ChevronDown, LogOut, User, Settings as SettingsIcon, Globe as Globe2, Sun, Moon, Monitor, Zap, Mail, MessageSquare, Check, Copy } from 'lucide-react';

const LOGO_URL = 'https://idealfrank.sirv.com/rev_by_famx_gradient.png';

interface Project {
  id: string;
  name: string;
  domain: string;
  trackingId: string;
  createdAt: string;
}

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
}

export const ProjectContext = createContext<ProjectContextType>({
  selectedProject: null,
  setSelectedProject: () => {},
  projects: [],
  setProjects: () => {}
});

export const useProject = () => useContext(ProjectContext);

const FEEDBACK_EMAIL = 'profamx@gmail.com';

function FeedbackButton({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, setOpen]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(FEEDBACK_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = FEEDBACK_EMAIL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-700 dark:text-gray-300"
      >
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
        <span className="flex-1 text-left font-medium">Feedback</span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Send feedback to</p>
            <button
              onClick={copyEmail}
              className="w-full flex items-center gap-2 text-left group"
              title="Click to copy"
            >
              <Mail className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">{FEEDBACK_EMAIL}</span>
              {copied ? (
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 flex-shrink-0" />
              )}
            </button>
            {copied && (
              <p className="text-[11px] text-green-600 dark:text-green-400 mt-1.5 flex items-center gap-1">
                <Check className="h-3 w-3" /> Copied to clipboard
              </p>
            )}
          </div>
          <a
            href={`mailto:${FEEDBACK_EMAIL}`}
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Open in mail app
          </a>
        </div>
      )}
    </div>
  );
}

function ThemeSubMenu() {
  const { mode, setMode } = useTheme();
  const options: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];
  return (
    <div className="px-3 py-2.5">
      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Theme</p>
      <div className="flex items-center gap-2">
        {options.map(opt => {
          const Icon = opt.icon;
          const isActive = mode === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              title={opt.label}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white border-2 border-white shadow-[0_0_12px_rgba(99,102,241,0.7)] dark:border-gray-200'
                  : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type DropdownId = 'project' | 'user' | 'feedback' | null;

function DashboardApp() {
  const { user, logout, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'analytics' | 'docs' | 'events' | 'sessions' | 'visitors' | 'projects' | 'settings'>('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  const [showLanding, setShowLanding] = useState(true);
  const sidebarRef = useRef<HTMLElement>(null);

  const closeDropdowns = () => setOpenDropdown(null);
  const toggleDropdown = (id: Exclude<DropdownId, null>) =>
    setOpenDropdown(prev => (prev === id ? null : id));

  useEffect(() => {
    const userId = (() => {
      try {
        const authUser = localStorage.getItem('auth_user');
        if (authUser) {
          const user = JSON.parse(authUser);
          return user.id || '';
        }
      } catch {}
      return '';
    })();

    fetch(`https://api1-orpin.vercel.app/api/projects?userId=${encodeURIComponent(userId)}`)
      .then(res => res.json())
      .then(data => {
        setProjects(data.projects || []);
        const savedProjectId = localStorage.getItem('selectedProjectId');
        if (savedProjectId) {
          const found = (data.projects || []).find((p: Project) => p.id === savedProjectId);
          if (found) {
            setSelectedProject(found);
            setCurrentPage('analytics');
          }
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('selectedProjectId', selectedProject.id);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        closeDropdowns();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openDropdown]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!user) {
    if (showLanding) {
      return <Landing onEnterApp={() => setShowLanding(false)} />;
    }
    return <Login onBackHome={() => setShowLanding(true)} />;
  }

  const userDisplayName = user.name || user.email || 'User';

  const navButton = (page: typeof currentPage, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => {
        setCurrentPage(page);
        closeDropdowns();
      }}
      disabled={page !== 'projects' && page !== 'docs' && !selectedProject}
      className={`group w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
        currentPage === page
          ? 'text-gray-900 dark:text-white shadow-[0_0_10px_rgba(180,180,180,0.5)] dark:shadow-[0_0_10px_rgba(120,120,120,0.35)]'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
      } ${(page !== 'projects' && page !== 'docs' && !selectedProject) ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <span className={`transition-colors ${currentPage === page ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 group-hover:text-indigo-500'}`}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );

  return (
    <ProjectContext.Provider value={{ selectedProject, setSelectedProject, projects, setProjects }}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Sidebar */}
        <aside ref={sidebarRef} className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col sticky top-0 h-screen overflow-y-auto flex-shrink-0">
          {/* Brand */}
          <div className="px-5 py-5 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <img src={LOGO_URL} alt="Famx REV" className="h-9 w-auto" />
              <div>
                <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Famx REV</h1>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">Real-time insights</p>
              </div>
            </div>
          </div>

          <div className="px-3 py-4">
            {/* Project Selector */}
            <div className="mb-5">
              <label className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 px-1 block">Current Project</label>
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('project')}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white dark:hover:bg-gray-800 transition-all text-gray-800 dark:text-gray-200 text-sm"
                >
                  <span className="truncate flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                    {selectedProject ? selectedProject.name : 'Select a project'}
                  </span>
                  <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform ${openDropdown === 'project' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'project' && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto py-1">
                    <button
                      onClick={() => {
                        setSelectedProject(null);
                        closeDropdowns();
                        setCurrentPage('projects');
                      }}
                      className="w-full px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm flex items-center gap-2"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Manage Projects
                    </button>
                    {projects.length > 0 && <div className="border-t border-gray-100 dark:border-gray-700 my-1" />}
                    {projects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setSelectedProject(project);
                          closeDropdowns();
                          if (currentPage === 'projects') {
                            setCurrentPage('analytics');
                          }
                        }}
                        className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                          selectedProject?.id === project.id
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selectedProject?.id === project.id ? 'bg-gray-500 dark:bg-gray-300' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        {project.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {navButton('projects', 'Projects', <FolderOpen className="h-[18px] w-[18px]" />)}
              {navButton('analytics', 'Dashboard', <LayoutDashboard className="h-[18px] w-[18px]" />)}
              {navButton('events', 'Events', <List className="h-[18px] w-[18px]" />)}
              {navButton('sessions', 'Sessions', <Video className="h-[18px] w-[18px]" />)}
              {navButton('visitors', 'Visitors', <Globe2 className="h-[18px] w-[18px]" />)}
              {navButton('docs', 'Documentation', <FileText className="h-[18px] w-[18px]" />)}
              {navButton('settings', 'Settings', <SettingsIcon className="h-[18px] w-[18px]" />)}
            </nav>
          </div>

          {/* Footer: Feedback + User */}
          <div className="mt-auto px-3 pb-3">
            {/* Feedback Button */}
            <div className="pt-3 pb-2 border-t border-gray-200 dark:border-gray-800">
              <FeedbackButton open={openDropdown === 'feedback'} setOpen={(v) => setOpenDropdown(v ? 'feedback' : null)} />
            </div>

            {/* User Menu */}
            <div className="relative pt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => toggleDropdown('user')}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="truncate text-sm flex-1 text-left font-medium">{userDisplayName}</span>
                <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform ${openDropdown === 'user' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'user' && (
                <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userDisplayName}</p>
                    {user.email && user.email !== userDisplayName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    )}
                  </div>
                  <ThemeSubMenu />
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        logout();
                        closeDropdowns();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-sm font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-auto" onClick={closeDropdowns}>
          {currentPage === 'projects' ? <Projects /> :
           currentPage === 'analytics' ? <Analytics /> :
           currentPage === 'events' ? <Events /> :
           currentPage === 'sessions' ? <Sessions /> :
           currentPage === 'visitors' ? <Visitors /> :
           currentPage === 'settings' ? <Settings /> :
           <Documentation />}
        </div>
      </div>
    </ProjectContext.Provider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DashboardApp />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
