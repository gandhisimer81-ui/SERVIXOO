import { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { Skill } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  LineChart, 
  Cpu, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert
} from 'lucide-react';
import { useTheme } from '../components/ThemeContext';

interface DecaySkill {
  name: string;
  category: string;
  status: 'fading' | 'rising';
  decayRate: string;
  reason: string;
  alternative: string;
}

const SKILL_DECAY_DATABASE: DecaySkill[] = [
  {
    name: 'jQuery',
    category: 'Frontend',
    status: 'fading',
    decayRate: '-34% / yr',
    reason: 'Native ES6+ DOM APIs and modern component frameworks (React/Vue) have made jQuery redundant.',
    alternative: 'React, TypeScript, Native DOM APIs'
  },
  {
    name: 'LLM Tooling & Vector DBs',
    category: 'AI & Data',
    status: 'rising',
    decayRate: '+142% / yr',
    reason: 'Commercial demand for RAG architectures, LangChain, and embedding retrieval in enterprise apps.',
    alternative: 'Pinecone, Chroma, OpenAI/Gemini SDKs'
  },
  {
    name: 'Turbo C++ / Turbo Pascal',
    category: 'Compilers',
    status: 'fading',
    decayRate: '-85% / yr',
    reason: 'Obsolete 16-bit DOS compiler still taught in some colleges, not supported on modern 64-bit systems.',
    alternative: 'Modern GCC, Clang, VS Code, CMake'
  },
  {
    name: 'FastAPI & Async Python',
    category: 'Backend',
    status: 'rising',
    decayRate: '+88% / yr',
    reason: 'High-performance microservices, automatic OpenAPI documentation, and machine learning model serving.',
    alternative: 'FastAPI, Pydantic, Starlette'
  },
  {
    name: 'Flash / ActionScript',
    category: 'Web Media',
    status: 'fading',
    decayRate: '-99% / yr',
    reason: 'End-of-life globally, completely replaced by HTML5 Canvas, SVG, WebGL, and Three.js.',
    alternative: 'Three.js, Canvas API, WebGL'
  },
  {
    name: 'Docker & Containerization',
    category: 'DevOps',
    status: 'rising',
    decayRate: '+95% / yr',
    reason: 'Standard baseline for repeatable software execution across developer machines and cloud providers.',
    alternative: 'Docker Compose, Kubernetes'
  }
];

export default function SkillTrends() {
  const { isDark } = useTheme();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [decayFilter, setDecayFilter] = useState<'all' | 'fading' | 'rising'>('all');

  useEffect(() => {
    async function fetchSkills() {
      try {
        const res = await fetch('/api/skills/trending');
        const data = await res.json();
        setSkills(data);
        if (data.length > 0) {
          setSelectedSkillId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching skills trends:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, []);

  const selectedSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];

  // Prepare chart data combining historical and forecasted scores
  const chartData: any[] = [];
  if (selectedSkill) {
    const historical = selectedSkill.historical || [50, 52, 54, 53, 55, 58];
    const forecast = selectedSkill.forecast || [60, 62, 63];

    // Historical periods
    historical.forEach((score, idx) => {
      const periodLabel = idx === historical.length - 1 ? 'Current' : `M-${historical.length - 1 - idx}`;
      chartData.push({
        period: periodLabel,
        'Historical Score': score,
        'Forecasted Score': null,
      });
    });

    // Forecast periods
    forecast.forEach((score, idx) => {
      chartData.push({
        period: `F+${idx + 1}`,
        'Historical Score': idx === 0 ? historical[historical.length - 1] : null,
        'Forecasted Score': score,
      });
    });
  }

  const filteredDecaySkills = decayFilter === 'all' 
    ? SKILL_DECAY_DATABASE 
    : SKILL_DECAY_DATABASE.filter(s => s.status === decayFilter);

  return (
    <div className={`w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 transition-colors ${
      isDark ? 'bg-[#080E1E] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`} id="skill-trends-page">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700/40 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2 border shadow-xs bg-cyan-950/60 border-cyan-700/50 text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Machine Learning Predictive Analytics & Obsolescence Guard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Skill Market Trends & Decay Radar
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Predicting competency demand over the next 3 quarters using Linear Regression & flagging fading vs rising skills so students never chase obsolete technologies.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ROW 1: Trend Forecast Chart + Sidebar Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sidebar Skill Selector (4 cols) */}
          <div className={`lg:col-span-4 rounded-2xl border p-5 shadow-xl flex flex-col justify-between ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/40">
                <span className="font-bold text-xs uppercase tracking-wider text-cyan-400">
                  Tracked In-Demand Skills
                </span>
                <span className="text-[10px] text-slate-400">Click to forecast</span>
              </div>

              {loading ? (
                <div className="space-y-2 animate-pulse">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className={`h-12 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {skills.map((skill) => {
                    const isSelected = skill.id === selectedSkillId;
                    return (
                      <button
                        key={skill.id}
                        onClick={() => setSelectedSkillId(skill.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-400 text-white font-bold shadow-sm'
                            : isDark
                              ? 'bg-[#080E1E] border-slate-800 hover:bg-slate-800 text-slate-300'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="truncate max-w-[140px]">{skill.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{skill.category}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            {skill.demand_score}%
                          </span>
                          {skill.trend_direction === 'UP' ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-700/40 text-[10px] text-slate-400">
              ⚡ Forecasts computed via Python LinearRegression microservice.
            </div>
          </div>

          {/* Area Chart View (8 cols) */}
          <div className={`lg:col-span-8 rounded-2xl border p-6 shadow-xl flex flex-col justify-between ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-700/40">
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Demand Trajectory: {selectedSkill?.name || 'Selected Competency'}
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Historical (M-5 to Current) & Predictive Forecast (F+1 to F+3)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Trend: {selectedSkill?.trend_direction || 'UP'}
                  </span>
                </div>
              </div>

              {/* Chart Container */}
              <div className="w-full h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="historicalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} />
                    <XAxis 
                      dataKey="period" 
                      stroke={isDark ? '#94A3B8' : '#64748B'} 
                      fontSize={11} 
                      tickLine={false} 
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      stroke={isDark ? '#94A3B8' : '#64748B'} 
                      fontSize={11} 
                      tickLine={false} 
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0B132B' : '#FFFFFF',
                        borderColor: isDark ? '#334155' : '#CBD5E1',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                      }}
                    />

                    <ReferenceLine x="Current" stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Now', fill: '#F59E0B', fontSize: 10 }} />

                    {/* Historical Area */}
                    <Area
                      type="monotone"
                      dataKey="Historical Score"
                      stroke="#00F0FF"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#historicalGrad)"
                    />

                    {/* Forecasted Area */}
                    <Area
                      type="monotone"
                      dataKey="Forecasted Score"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#forecastGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-700/40">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                Historical Metric
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                Next 3 Periods Forecast
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                Present Baseline
              </span>
            </div>
          </div>

        </div>

        {/* ROW 2: Skill Decay / Relevance Timer (Flagging Fading vs Rising Skills) */}
        <div className={`rounded-2xl border p-6 shadow-xl ${
          isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-700/40 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-white">
                  Skill Decay & Obsolescence Radar
                </h3>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Flagging declining technologies vs hyper-growth competencies to prevent wasted study time
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
              {(['all', 'rising', 'fading'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setDecayFilter(f)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                    decayFilter === f
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDecaySkills.map((s, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  s.status === 'fading'
                    ? 'bg-red-950/20 border-red-900/40'
                    : 'bg-emerald-950/20 border-emerald-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white">{s.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                      s.status === 'fading'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {s.status === 'fading' ? '⚠️ Fading' : '🚀 Rising'} {s.decayRate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {s.reason}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    {s.status === 'fading' ? 'Replace with Modern Standard:' : 'Essential Tooling:'}
                  </span>
                  <span className="text-xs font-semibold text-cyan-300">{s.alternative}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
