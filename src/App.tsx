import React, { createContext, useContext, useState, useEffect } from 'react';
import Analytics from './pages/Analytics';
import Documentation from './pages/Documentation';
import Events from './pages/Events';
import Sessions from './pages/Sessions';
import Visitors from './pages/Visitors';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ThemeProvider, useTheme, ThemeMode } from './auth/ThemeContext';
import { LayoutDashboard, FileText, List, Video, FolderOpen, ChevronDown, LogOut, User, Settings as SettingsIcon, Globe as Globe2, Sun, Moon, Monitor } from 'lucide-react';

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

function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const options: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];
  const active = options.find(o => o.value === mode) || options[2];
  const ActiveIcon = active.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-700 dark:text-gray-300"
      >
        <ActiveIcon className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
        <span className="flex-1 text-left">Theme: {active.label}</span>
        <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200 dark:border-gray-700">
            {options.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setMode(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                    mode === opt.value ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function DashboardApp() {
  const { user, logout, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'analytics' | 'docs' | 'events' | 'sessions' | 'visitors' | 'projects' | 'settings'>('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const userDisplayName = user.name || user.email || 'User';

  const navButton = (page: typeof currentPage, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setCurrentPage(page)}
      disabled={page !== 'projects' && page !== 'docs' && !selectedProject}
      className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        currentPage === page
          ? 'bg-indigo-600 text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      } ${(page !== 'projects' && page !== 'docs' && !selectedProject) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <ProjectContext.Provider value={{ selectedProject, setSelectedProject, projects, setProjects }}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col sticky top-0 h-screen overflow-y-auto flex-shrink-0">
          <h1 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Analytics Dashboard</h1>

          {/* Project Selector */}
          <div className="mb-6">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Current Project</label>
            <div className="relative">
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200 text-sm"
              >
                <span className="truncate">
                  {selectedProject ? selectedProject.name : 'Select a project'}
                </span>
                <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              </button>

              {showProjectDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      setShowProjectDropdown(false);
                      setCurrentPage('projects');
                    }}
                    className="w-full px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors text-sm"
                  >
                    <FolderOpen className="h-4 w-4 inline mr-2" />
                    Manage Projects
                  </button>
                  {projects.length > 0 && <div className="border-t border-gray-200 dark:border-gray-700" />}
                  {projects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setSelectedProject(project);
                        setShowProjectDropdown(false);
                        if (currentPage === 'projects') {
                          setCurrentPage('analytics');
                        }
                      }}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                        selectedProject?.id === project.id
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {project.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {navButton('projects', 'Projects', <FolderOpen className="h-5 w-5" />)}
            {navButton('analytics', 'Dashboard', <LayoutDashboard className="h-5 w-5" />)}
            {navButton('events', 'Events', <List className="h-5 w-5" />)}
            {navButton('sessions', 'Sessions', <Video className="h-5 w-5" />)}
            {navButton('visitors', 'Visitors', <Globe2 className="h-5 w-5" />)}
            {navButton('docs', 'Documentation', <FileText className="h-5 w-5" />)}
            {navButton('settings', 'Settings', <SettingsIcon className="h-5 w-5" />)}
          </nav>

          {/* Theme Toggle */}
          <div className="pt-3 pb-2 border-t border-gray-200 dark:border-gray-800">
            <ThemeToggle />
          </div>

          {/* User Menu */}
          <div className="relative pt-2 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="truncate text-sm flex-1 text-left">{userDisplayName}</span>
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-900 dark:text-white truncate">{userDisplayName}</p>
                  {user.email && user.email !== userDisplayName && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-b-lg transition-colors text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
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
