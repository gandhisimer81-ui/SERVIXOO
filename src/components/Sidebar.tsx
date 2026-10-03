import { LayoutDashboard, Briefcase, Award, FileSpreadsheet, GraduationCap, TrendingUp, X } from 'lucide-react';
import Logo from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, description: 'Labour intelligence overview' },
    { id: 'market', name: 'Labour Market', icon: Briefcase, description: 'Market trends & AI extraction' },
    { id: 'skill_gap', name: 'Skill Gap', icon: Award, description: 'Student skill analysis' },
    { id: 'curriculum', name: 'Curriculum', icon: FileSpreadsheet, description: 'AI syllabus recommendations' },
    { id: 'job_matching', name: 'Job Matching', icon: GraduationCap, description: 'AI student job connection' },
    { id: 'reports', name: 'Reports', icon: TrendingUp, description: 'District alignment report' },
  ];

  return (
    <>
      {/* Mobile background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 md:w-85 h-screen bg-[#0f172a] text-slate-100 flex flex-col justify-between border-r border-slate-800 shrink-0 select-none transition-transform duration-300 md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        id="sidebar-container"
      >
        <div className="flex flex-col gap-8 p-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between py-2">
            <Logo theme="dark" hideSubtext={true} className="h-10 w-auto" />
            
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

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-slate-800 to-transparent" />

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left transition-all duration-250 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/15 scale-[1.02]'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 hover:scale-[1.01]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-wide">{item.name}</span>
                  <span className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-6 border-t border-slate-800/50">
        <p className="text-[10px] text-slate-500 text-center">
          &copy; 2026 SERVIXOO. All Rights Reserved.
        </p>
      </div>
    </aside>
    </>
  );
}
