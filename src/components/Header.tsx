import { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, TrendingUp, Cpu, Calendar, Clock, GraduationCap, ArrowRight, ShieldCheck, ListChecks, Building } from 'lucide-react';

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
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [syllabusUnits, setSyllabusUnits] = useState<SyllabusUnitResult[]>([]);
  const [skills, setSkills] = useState<SkillResult[]>([]);
  const [marketSkills, setMarketSkills] = useState<MarketSkillResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Selected item modal state
  const [selectedUnit, setSelectedUnit] = useState<SyllabusUnitResult | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillResult | null>(null);
  const [selectedMarketSkill, setSelectedMarketSkill] = useState<MarketSkillResult | null>(null);

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

  // Keyboard shortcut to focus search bar (Ctrl+K or /)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== inputRef.current) {
        // Prevent typing '/' in search bar when focusing
        const isInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
        if (!isInput) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter logic
  const normalizedQuery = query.toLowerCase().trim();

  const filteredUnits = normalizedQuery
    ? syllabusUnits.filter(
        (unit) =>
          unit.subject_name.toLowerCase().includes(normalizedQuery) ||
          unit.course_name.toLowerCase().includes(normalizedQuery) ||
          unit.course_stream.toLowerCase().includes(normalizedQuery) ||
          unit.unit_topics.toLowerCase().includes(normalizedQuery)
      ).slice(0, 5)
    : [];

  const filteredSkills = normalizedQuery
    ? skills.filter(
        (skill) =>
          skill.name.toLowerCase().includes(normalizedQuery) ||
          skill.category.toLowerCase().includes(normalizedQuery)
      ).slice(0, 5)
    : [];

  const filteredMarketSkills = normalizedQuery
    ? marketSkills.filter(
        (skill) =>
          skill.skill_name.toLowerCase().includes(normalizedQuery) ||
          skill.field.toLowerCase().includes(normalizedQuery) ||
          skill.typical_job_roles.toLowerCase().includes(normalizedQuery)
      ).slice(0, 5)
    : [];

  const hasResults = filteredUnits.length > 0 || filteredSkills.length > 0 || filteredMarketSkills.length > 0;

  // Render nice page status badge
  const getTabLabelAndStyle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { label: 'Labour Intelligence Dashboard', color: 'bg-blue-50 text-blue-600 border-blue-100' };
      case 'market':
        return { label: 'Labour Market Feed & AI NLP Sandbox', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
      case 'skill_gap':
        return { label: 'AI Skill Gap Diagnostic', color: 'bg-amber-50 text-amber-600 border-amber-100' };
      case 'curriculum':
        return { label: 'Curriculum Alignment Advisor', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'job_matching':
        return { label: 'AI Student Placement Matching', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
      case 'reports':
        return { label: 'Territorial Heatmap & Alignment Reports', color: 'bg-rose-50 text-rose-600 border-rose-100' };
      default:
        return { label: 'Active Workspace', color: 'bg-slate-50 text-slate-600 border-slate-100' };
    }
  };

  const statusInfo = getTabLabelAndStyle();

  return (
    <>
      <header
        className={`h-20 border-b shrink-0 flex items-center justify-between px-8 z-30 transition-all duration-300 ${
          activeTab === 'explorer'
            ? 'bg-slate-950 border-slate-800 text-slate-100'
            : 'bg-white border-slate-100 text-slate-800 shadow-sm'
        }`}
        id="global-navbar-header"
      >
        {/* Left side: Context badge / Current page indicator */}
        <div className="flex items-center gap-3">
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-tight border ${statusInfo.color}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>{statusInfo.label}</span>
          </div>
        </div>

        {/* Center/Right: Interactive Global Search Box */}
        <div className="relative w-full max-w-xl" ref={containerRef} id="global-search-container">
          <div
            className={`relative flex items-center w-full rounded-2xl border transition-all duration-300 ${
              activeTab === 'explorer'
                ? 'bg-slate-900 border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20'
                : 'bg-slate-50 border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:bg-white'
            }`}
          >
            <div className="absolute left-4 pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>

            <input
              ref={inputRef}
              type="text"
              placeholder="Search syllabus units, topics, or industry trends... (Press '/' or 'Ctrl+K' to focus)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsFocused(true);
              }}
              onFocus={() => setIsFocused(true)}
              className="w-full pl-11 pr-12 py-3 bg-transparent text-sm focus:outline-none placeholder-slate-400 font-medium leading-relaxed rounded-2xl"
            />

            {query ? (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="absolute right-4 hidden md:inline-flex items-center gap-0.5 h-6 select-none rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-bold text-slate-400 shadow-sm pointer-events-none">
                <span className="text-[9px]">⌘</span>K
              </kbd>
            )}
          </div>

          {/* Real-time categorized search results dropdown list */}
          {isFocused && normalizedQuery && (
            <div
              className={`absolute top-full left-0 right-0 mt-2.5 rounded-2xl shadow-xl border overflow-hidden max-h-[480px] overflow-y-auto z-50 transition-all duration-300 ${
                activeTab === 'explorer'
                  ? 'bg-slate-900 border-slate-800 text-slate-100 divide-y divide-slate-800'
                  : 'bg-white border-slate-100 text-slate-800 divide-y divide-slate-50 shadow-slate-200/60'
              }`}
            >
              {loading && (
                <div className="p-4 text-center text-xs text-slate-400 font-semibold animate-pulse">
                  Querying database index...
                </div>
              )}

              {!loading && !hasResults && (
                <div className="p-6 text-center text-sm text-slate-500 font-medium">
                  No matching curriculum units or trends found for "{query}"
                </div>
              )}

              {/* SECTION A: Syllabus Units */}
              {filteredUnits.length > 0 && (
                <div className="p-4">
                  <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2 flex items-center gap-1.5 px-2">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span>Curriculum Units & Subjects ({filteredUnits.length})</span>
                  </h3>
                  <div className="flex flex-col gap-1">
                    {filteredUnits.map((unit) => (
                      <button
                        key={`unit-${unit.id}`}
                        onClick={() => {
                          setSelectedUnit(unit);
                          setIsFocused(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-1 cursor-pointer ${
                          activeTab === 'explorer' ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                            {unit.subject_name}
                          </span>
                          <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                            Sem {unit.semester}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium truncate">
                          {unit.course_name} • {unit.unit_topics}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION B: Overall Skills & Categories */}
              {filteredSkills.length > 0 && (
                <div className="p-4">
                  <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2 flex items-center gap-1.5 px-2">
                    <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                    <span>Overall Market Skills & Demands ({filteredSkills.length})</span>
                  </h3>
                  <div className="flex flex-col gap-1">
                    {filteredSkills.map((skill) => (
                      <button
                        key={`skill-${skill.id}`}
                        onClick={() => {
                          setSelectedSkill(skill);
                          setIsFocused(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-1 cursor-pointer ${
                          activeTab === 'explorer' ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                            {skill.name}
                          </span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                              skill.trend_direction === 'UP'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                : skill.trend_direction === 'DOWN'
                                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                                : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {skill.trend_direction}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Category: {skill.category} • Index Score: {skill.demand_score}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION C: Sector Specific Market Skills */}
              {filteredMarketSkills.length > 0 && (
                <div className="p-4">
                  <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2 flex items-center gap-1.5 px-2">
                    <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Sector-Specific Market Skills ({filteredMarketSkills.length})</span>
                  </h3>
                  <div className="flex flex-col gap-1">
                    {filteredMarketSkills.map((mSkill) => (
                      <button
                        key={`mskill-${mSkill.id}`}
                        onClick={() => {
                          setSelectedMarketSkill(mSkill);
                          setIsFocused(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-1 cursor-pointer ${
                          activeTab === 'explorer' ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                            {mSkill.skill_name}
                          </span>
                          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                            {mSkill.field}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium truncate">
                          Roles: {mSkill.typical_job_roles}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* MODAL 1: Syllabus Unit Details Modals Card */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 transform transition-all flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Syllabus Subject Overview</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Academic curriculum unit specification</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Subject Title</span>
                <span className="text-lg font-bold text-slate-800">{selectedUnit.subject_name}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Semester</span>
                  <span className="text-sm font-bold text-slate-700">Sem {selectedUnit.semester}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Credit Value</span>
                  <span className="text-sm font-bold text-slate-700">{selectedUnit.credit_hours} Credits</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Degree Program</span>
                  <span className="text-xs font-semibold text-slate-700 truncate">{selectedUnit.course_stream}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Host Program Course</span>
                <div className="flex items-start gap-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <GraduationCap className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-slate-600 leading-relaxed">
                    {selectedUnit.course_name}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Subject Topics & Scope</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUnit.unit_topics.split(',').map((topic, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200/60 px-2.5 py-1 rounded-lg"
                    >
                      {topic.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between gap-3">
              <button
                onClick={() => setSelectedUnit(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100/60 rounded-xl transition-colors"
              >
                Cancel View
              </button>
              <button
                onClick={() => {
                  setSelectedUnit(null);
                  setActiveTab('analyzer');
                }}
                className="px-5 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/10 hover:bg-blue-700 flex items-center gap-1.5 transition-all"
              >
                <span>Compile AI Alignment Gaps</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Overall Skill / Trend Details */}
      {selectedSkill && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 transform transition-all flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Market Skill Demands</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Labour intelligence registry analysis</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSkill(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Skill Name</span>
                <span className="text-lg font-bold text-slate-800">{selectedSkill.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Category</span>
                  <span className="text-sm font-bold text-slate-700">{selectedSkill.category}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Growth Direction</span>
                  <span
                    className={`text-sm font-bold flex items-center gap-1 ${
                      selectedSkill.trend_direction === 'UP'
                        ? 'text-emerald-600'
                        : selectedSkill.trend_direction === 'DOWN'
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {selectedSkill.trend_direction === 'UP' && '▲ Upward Growth'}
                    {selectedSkill.trend_direction === 'DOWN' && '▼ Contraction'}
                    {selectedSkill.trend_direction === 'STABLE' && '◼ Consistent'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Labour Market Demand Index</span>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600">Hiring Priority score</span>
                    <span className="text-sm font-bold text-blue-600">{selectedSkill.demand_score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                      style={{ width: `${selectedSkill.demand_score}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  We recommend updating corresponding course models with {selectedSkill.name} projects to satisfy active hiring requirements across Bangalore tech zone.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between gap-3">
              <button
                onClick={() => setSelectedSkill(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100/60 rounded-xl transition-colors"
              >
                Cancel View
              </button>
              <button
                onClick={() => {
                  setSelectedSkill(null);
                  setActiveTab('trends');
                }}
                className="px-5 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/10 hover:bg-blue-700 flex items-center gap-1.5 transition-all"
              >
                <span>Analyze LSTM Forecasts</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Sector Specific Market Skill details */}
      {selectedMarketSkill && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 transform transition-all flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sector Skill Demand</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Targeted field competence mapping</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMarketSkill(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Skill Title</span>
                <span className="text-lg font-bold text-slate-800">{selectedMarketSkill.skill_name}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Industrial Field</span>
                  <span className="text-sm font-bold text-slate-700">{selectedMarketSkill.field}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Hiring Index</span>
                  <span className="text-sm font-bold text-slate-700">{selectedMarketSkill.demand_score}% Demand</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Primary Target Corporate Roles</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMarketSkill.typical_job_roles.split(',').map((role, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-indigo-50/50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-xl"
                    >
                      {role.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-indigo-50/20 border border-indigo-100/50 rounded-2xl flex items-start gap-3">
                <ListChecks className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Seeded directly from employers in active districts. Students seeking these roles are tested on their ability to integrate {selectedMarketSkill.skill_name} into modern business architectures.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between gap-3">
              <button
                onClick={() => setSelectedMarketSkill(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100/60 rounded-xl transition-colors"
              >
                Cancel View
              </button>
              <button
                onClick={() => {
                  setSelectedMarketSkill(null);
                  setActiveTab('student');
                }}
                className="px-5 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/10 hover:bg-blue-700 flex items-center gap-1.5 transition-all"
              >
                <span>Build Transition Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
