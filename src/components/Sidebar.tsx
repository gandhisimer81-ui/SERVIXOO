import { 
  LayoutDashboard, 
  Sparkles, 
  Award, 
  FileSpreadsheet, 
  TrendingUp, 
  X, 
  Sun, 
  Moon, 
  Briefcase,
  Compass,
  GraduationCap,
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react';
import Logo from './Logo';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  targetRole?: string;
  readinessScore?: number | null;
  onRequireAuth?: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  onClose,
  targetRole = 'Python Developer',
  readinessScore,
  onRequireAuth
}: SidebarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, userProfile, logout } = useAuth();

  // The 5 primary routes specified in user prompt
  const menuItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      tagline: 'Labour intelligence overview' 
    },
    { 
      id: 'skills_form', 
      name: 'My Skills & Dream Job', 
      icon: Briefcase, 
      tagline: 'Student skill intake & target role' 
    },
    { 
      id: 'readiness', 
      name: 'Readiness Report', 
      icon: Award, 
      tagline: 'Scikit-learn cosine match & 3D galaxy',
      badge: readinessScore !== null && readinessScore !== undefined ? `${readinessScore}%` : undefined
    },
    { 
      id: 'curriculum', 
      name: 'Curriculum Analyzer', 
      icon: FileSpreadsheet, 
      tagline: 'B.Tech CS & BBA comparison' 
    },
    { 
      id: 'trends', 
      name: 'Skill Trends', 
      icon: TrendingUp, 
      tagline: 'Decay timer & TensorFlow forecasts' 
    },
  ];

  return (
    <>
      {/* Mobile background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 md:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 h-screen bg-[#070D1E] text-slate-100 flex flex-col justify-between border-r border-slate-800/80 shrink-0 select-none transition-transform duration-300 md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        id="sidebar-container"
      >
        <div className="flex flex-col gap-5 p-5 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 font-black text-white text-lg">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                  SERVIXOO
                  <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 px-1.5 py-0.2 rounded">
                    PRO
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 tracking-wide">
                  Labour Market & Curriculum AI
                </span>
              </div>
            </div>
            
            {/* Close button for mobile */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg md:hidden cursor-pointer"
                aria-label="Close Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* User Account / Profile Box (Stored in Firestore) */}
          <div className="bg-[#0E1A38] border border-slate-750 rounded-2xl p-3.5 shadow-md flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-sm">
                  {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : (currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'G')}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white truncate max-w-[140px]">
                    {currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Guest Explorer')}
                  </span>
                  <span className="text-[10px] text-cyan-400 truncate max-w-[140px] font-medium">
                    {userProfile?.course || 'B.Tech Computer Science'}
                  </span>
                </div>
              </div>

              {currentUser ? (
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                onRequireAuth && (
                  <button
                    onClick={onRequireAuth}
                    className="text-[10px] px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30 font-bold cursor-pointer"
                  >
                    Sign In
                  </button>
                )
              )}
            </div>

            {/* University & Target details synced from Firestore */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="truncate max-w-[140px]">{userProfile?.college || 'VTU State Tech'}</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Firestore Synced
              </span>
            </div>
          </div>

          {/* Quick Target Role pill */}
          <div className="bg-[#0A1226] border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Current Target Role
              </span>
              <span className="text-xs font-bold text-cyan-300 truncate max-w-[160px]">
                {userProfile?.targetRole || targetRole}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-slate-800 via-slate-700/50 to-transparent" />

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider px-2 mb-1">
              Navigation Menu
            </span>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white font-semibold border border-cyan-500/40 shadow-md shadow-cyan-950/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40' 
                        : 'bg-slate-850 text-slate-400 group-hover:text-slate-200'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs tracking-tight ${isActive ? 'text-white font-bold' : 'text-slate-300'}`}>
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-300 truncate max-w-[150px]">
                        {item.tagline}
                      </span>
                    </div>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area: Dark Mode Toggle & System Stamp */}
        <div className="p-4 border-t border-slate-800/80 bg-[#060B18] flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-slate-300 font-medium">Theme Mode</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              aria-label="Toggle theme mode"
            >
              {isDark ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[10px] text-slate-400 text-center font-mono pt-1">
            Firebase Auth • Firestore • Scikit-Learn
          </div>
        </div>
      </aside>
    </>
  );
}
