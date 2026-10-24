import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  BookOpen, 
  TrendingUp, 
  Cpu, 
  Menu, 
  Sun, 
  Moon, 
  ChevronRight, 
  Sparkles,
  Award,
  Briefcase,
  LogOut
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';

interface SyllabusUnitResult {
  id: number;
  course_id: number;
  subject_name: string;
  unit_topics: string;
  semester: number;
  credit_hours: number;
  course_name: string;
  course_stream: string;
}

interface SkillResult {
  id: number;
  name: string;
  category: string;
  demand_score: number;
  trend_direction: 'UP' | 'DOWN' | 'STABLE';
}

interface MarketSkillResult {
  id: number;
  field: string;
  skill_name: string;
  demand_score: number;
  is_trending: number;
  typical_job_roles: string;
}

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onMenuClick?: () => void;
  targetRole?: string;
  readinessScore?: number | null;
}

const TAB_BREADCRUMBS: Record<string, { category: string; page: string }> = {
  dashboard: { category: 'Labour Market', page: 'Intelligence Dashboard' },
  skills_form: { category: 'Student Intake', page: 'My Skills & Dream Job' },
  readiness: { category: 'Scikit-learn Match', page: 'Readiness Report' },
  curriculum: { category: 'Syllabus Engine', page: 'Curriculum Analyzer' },
  trends: { category: 'Predictive Analytics', page: 'Skill Trends & Decay' },
};

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onMenuClick,
  targetRole = 'Python Developer',
  readinessScore
}: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [syllabusUnits, setSyllabusUnits] = useState<SyllabusUnitResult[]>([]);
  const [skills, setSkills] = useState<SkillResult[]>([]);
  const [marketSkills, setMarketSkills] = useState<MarketSkillResult[]>([]);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search data on mount
  useEffect(() => {
    async function fetchSearchData() {
      setLoading(true);
      try {
        const res = await fetch('/api/global-search-data');
        if (res.ok) {
          const data = await res.json();
          setSyllabusUnits(data.syllabusUnits || []);
          setSkills(data.skills || []);
          setMarketSkills(data.marketSkills || []);
        }
      } catch (err) {
        console.error('Error fetching global search data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSearchData();
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items
  const cleanQ = query.trim().toLowerCase();
  const matchedUnits = cleanQ 
    ? syllabusUnits.filter(u => u.subject_name.toLowerCase().includes(cleanQ) || u.unit_topics.toLowerCase().includes(cleanQ)).slice(0, 4)
    : [];
  const matchedSkills = cleanQ
    ? skills.filter(s => s.name.toLowerCase().includes(cleanQ)).slice(0, 4)
    : [];

  const breadcrumb = TAB_BREADCRUMBS[activeTab] || { category: 'Servixoo', page: 'Portal' };

  return (
    <header className={`sticky top-0 z-30 w-full backdrop-blur-md border-b transition-colors ${
      isDark 
        ? 'bg-[#080E1E]/90 border-slate-800 text-slate-100' 
        : 'bg-white/90 border-slate-200 text-slate-800'
    }`} id="sticky-app-header">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left Section: Mobile Menu Button + Breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onMenuClick}
            className={`p-2 rounded-xl md:hidden transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
            }`}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`font-semibold hidden sm:inline ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Servixoo
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
            <span className={`hidden md:inline ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {breadcrumb.category}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 hidden md:inline" />
            <span className={`font-bold truncate max-w-[130px] sm:max-w-none ${
              isDark ? 'text-cyan-400' : 'text-blue-600'
            }`}>
              {breadcrumb.page}
            </span>
          </div>
        </div>

        {/* Center Section: Global Search */}
        <div className="flex-1 max-w-md relative" ref={containerRef}>
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? 'text-slate-400' : 'text-slate-400'
            }`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search syllabus, Python, SQL..."
              className={`w-full pl-9 pr-16 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                isDark 
                  ? 'bg-[#101A33] border-slate-700/80 text-white placeholder-slate-400 focus:ring-cyan-500/40 focus:border-cyan-500' 
                  : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-500/40 focus:border-blue-500'
              }`}
            />
            {query ? (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded border pointer-events-none hidden sm:inline ${
                isDark ? 'border-slate-700 text-slate-400 bg-slate-800' : 'border-slate-200 text-slate-500 bg-white'
              }`}>
                ⌘K
              </span>
            )}
          </div>

          {/* Search Dropdown */}
          {isFocused && cleanQ && (
            <div className={`absolute top-full mt-2 left-0 right-0 rounded-xl shadow-2xl border p-2 z-50 max-h-80 overflow-y-auto ${
              isDark ? 'bg-[#0E172E] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              {matchedSkills.length === 0 && matchedUnits.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching syllabus topics or skills found for "{query}".
                </div>
              ) : (
                <>
                  {matchedSkills.length > 0 && (
                    <div className="mb-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-1">
                        In-Demand Skills
                      </div>
                      {matchedSkills.map(s => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setIsFocused(false);
                            setActiveTab('trends');
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <span className="font-medium">{s.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                            {s.demand_score}% Demand
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchedUnits.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 px-2 py-1">
                        Syllabus Units
                      </div>
                      {matchedUnits.map(u => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setIsFocused(false);
                            setActiveTab('curriculum');
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                            isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="font-medium truncate">{u.subject_name}</div>
                          <div className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {u.course_name} (Sem {u.semester})
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Active Target Pill & Theme Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Target Dream Job quick badge */}
          <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${
            isDark 
              ? 'bg-[#101A33] border-slate-700 text-slate-300' 
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px]">Role:</span>
            <span className="text-cyan-400 font-bold">{targetRole}</span>
          </div>

          {/* User profile / Auth chip */}
          {currentUser ? (
            <div className={`flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl text-xs font-semibold border ${
              isDark 
                ? 'bg-[#101A33] border-slate-700 text-slate-200' 
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <div className="w-5 h-5 rounded-full bg-cyan-500/30 text-cyan-300 flex items-center justify-center text-[10px] font-bold">
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U')}
              </div>
              <span className="truncate max-w-[100px] hidden sm:inline text-[11px]">
                {currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Student')}
              </span>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-1 hover:bg-slate-700/50 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('auth')}
              className="text-xs px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-xs cursor-pointer"
            >
              Sign In
            </button>
          )}

          {/* Theme toggle button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark 
                ? 'bg-[#101A33] border-slate-700/80 text-amber-400 hover:text-amber-300 hover:border-amber-400/40' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300'
            }`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-label="Toggle dark/light mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-cyan-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
