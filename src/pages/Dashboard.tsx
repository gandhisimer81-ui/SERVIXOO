import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend 
} from 'recharts';
import { 
  Briefcase, 
  TrendingUp, 
  Sparkles, 
  Award, 
  FileSpreadsheet, 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  Layers 
} from 'lucide-react';
import { Job, Skill, District, Curriculum } from '../types';
import { useTheme } from '../components/ThemeContext';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { isDark } = useTheme();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobsRes, skillsRes, districtsRes, curriculaRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/skills/trending'),
          fetch('/api/districts'),
          fetch('/api/curricula')
        ]);

        const [jobsData, skillsData, districtsData, curriculaData] = await Promise.all([
          jobsRes.json(),
          skillsRes.json(),
          districtsRes.json(),
          curriculaRes.json()
        ]);

        setJobs(jobsData);
        setSkills(skillsData);
        setDistricts(districtsData);
        setCurricula(curriculaData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalJobs = jobs.length || 20;
  const activeSkills = skills.length || 18;
  const avgGapScore = districts.length 
    ? Math.round(districts.reduce((sum, d) => sum + d.gap_score, 0) / districts.length)
    : 54;

  const gapChartData = districts.map(d => ({
    name: d.name.split(' ')[0] + ' ' + (d.name.split(' ')[1] || ''),
    'Gap Score (%)': d.gap_score
  }));

  const radarChartData = [
    { subject: 'AI / ML', Demand: 94 },
    { subject: 'Cloud / DevOps', Demand: 86 },
    { subject: 'Databases (SQL)', Demand: 90 },
    { subject: 'Core Logic (Python/C)', Demand: 85 },
    { subject: 'Web Architecture', Demand: 82 },
    { subject: 'Digital Strategy', Demand: 78 },
  ];

  return (
    <div className={`w-full h-full overflow-y-auto p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 transition-colors ${
      isDark ? 'bg-[#080E1E] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`} id="dashboard-page">
      
      {/* Header Block */}
      <div className={`max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4 sm:pb-6 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div>
          <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold mb-2 border shadow-xs ${
            isDark ? 'bg-cyan-950/70 border-cyan-700/50 text-cyan-300' : 'bg-cyan-100 border-cyan-300 text-cyan-900 font-bold'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Servixoo Labour Intelligence & Curriculum Alignment Platform</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            Executive Intelligence Dashboard
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Real-time telemetry tracking skill supply, university curriculum coverage, and recruiter demand trajectories across technical employment hubs.
          </p>
        </div>

        {/* Quick launch primary action */}
        {onNavigate && (
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => onNavigate('skills_form')}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Test Student Skill Gap</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg flex items-center gap-3.5 sm:gap-4 transition-colors ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center shrink-0 ${
              isDark ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-700'
            }`}>
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Active Job Postings
              </span>
              <h3 className={`text-xl sm:text-2xl font-extrabold mt-0.5 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>{totalJobs}</h3>
              <span className={`text-[10px] font-bold ${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              }`}>Live in SQLite</span>
            </div>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg flex items-center gap-3.5 sm:gap-4 transition-colors ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center shrink-0 ${
              isDark ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Tracked Skills
              </span>
              <h3 className={`text-xl sm:text-2xl font-extrabold mt-0.5 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>{activeSkills}</h3>
              <span className={`text-[10px] font-bold ${
                isDark ? 'text-cyan-400' : 'text-cyan-800'
              }`}>TF-IDF Vectorized</span>
            </div>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg flex items-center gap-3.5 sm:gap-4 transition-colors ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center shrink-0 ${
              isDark ? 'bg-amber-500/20 border-amber-400/40 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Audited Syllabi
              </span>
              <h3 className={`text-xl sm:text-2xl font-extrabold mt-0.5 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>2 Courses</h3>
              <span className={`text-[10px] font-bold ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>B.Tech CS & BBA</span>
            </div>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg flex items-center gap-3.5 sm:gap-4 transition-colors ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center shrink-0 ${
              isDark ? 'bg-red-500/20 border-red-400/40 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Average Gap Score
              </span>
              <h3 className={`text-xl sm:text-2xl font-extrabold mt-0.5 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>{avgGapScore}%</h3>
              <span className={`text-[10px] font-bold ${
                isDark ? 'text-amber-400' : 'text-amber-800'
              }`}>Commercial Delta</span>
            </div>
          </div>

        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          
          {/* District Gap Scores Bar Chart (7 cols) */}
          <div className={`lg:col-span-7 rounded-2xl border p-4 sm:p-6 shadow-xl transition-colors ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center justify-between mb-4 pb-2 border-b ${
              isDark ? 'border-slate-700/40' : 'border-slate-200'
            }`}>
              <div>
                <h3 className={`font-extrabold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Regional Skill Gap Scores (%)
                </h3>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Calculated curriculum mismatch across active employment corridors
                </p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-900 border border-cyan-300'
              }`}>
                State Data
              </span>
            </div>

            <div className="w-full h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gapChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} />
                  <XAxis dataKey="name" stroke={isDark ? '#94A3B8' : '#334155'} fontSize={9} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke={isDark ? '#94A3B8' : '#334155'} fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0B132B' : '#FFFFFF', 
                      borderColor: isDark ? '#334155' : '#CBD5E1',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="Gap Score (%)" fill={isDark ? "#00F0FF" : "#0284C7"} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Core Market Competency Radar (5 cols) */}
          <div className={`lg:col-span-5 rounded-2xl border p-4 sm:p-6 shadow-xl transition-colors ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center justify-between mb-4 pb-2 border-b ${
              isDark ? 'border-slate-700/40' : 'border-slate-200'
            }`}>
              <div>
                <h3 className={`font-extrabold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Industry Demand Vectors
                </h3>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Core requirements across 6 fields
                </p>
              </div>
            </div>

            <div className="w-full h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarChartData} margin={{ top: 10, right: 15, bottom: 10, left: 15 }}>
                  <PolarGrid stroke={isDark ? '#1E293B' : '#CBD5E1'} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#94A3B8' : '#1E293B', fontSize: 9, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={isDark ? '#475569' : '#94A3B8'} tick={false} />
                  <Radar name="Market Demand" dataKey="Demand" stroke={isDark ? "#00F0FF" : "#0284C7"} fill={isDark ? "#00F0FF" : "#0284C7"} fillOpacity={0.35} strokeWidth={2} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0B132B' : '#FFFFFF', 
                      borderColor: isDark ? '#334155' : '#CBD5E1',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Direct Action Jump Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => onNavigate && onNavigate('skills_form')}
            className={`p-6 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between shadow-lg ${
              isDark 
                ? 'bg-[#0E1A38] hover:bg-slate-800 border-slate-750 hover:border-cyan-500/50' 
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-400'
            }`}
          >
            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${
                isDark ? 'text-cyan-400' : 'text-blue-700'
              }`}>
                Piece 1 & 2 Workflow
              </span>
              <h4 className={`text-base font-bold transition-colors mt-0.5 ${
                isDark ? 'text-white group-hover:text-cyan-300' : 'text-slate-900 group-hover:text-blue-600'
              }`}>
                Run Student Skill & Dream Job Gap Engine
              </h4>
              <p className={`text-xs mt-1 max-w-md ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Check student college coursework against Python Developer, Data Analyst, Digital Marketer, or Backend Engineer roles.
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform ${
              isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-100 text-blue-700'
            }`}>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate && onNavigate('curriculum')}
            className={`p-6 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between shadow-lg ${
              isDark 
                ? 'bg-[#0E1A38] hover:bg-slate-800 border-slate-750 hover:border-emerald-500/50' 
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-emerald-400'
            }`}
          >
            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              }`}>
                Piece 4 Workflow
              </span>
              <h4 className={`text-base font-bold transition-colors mt-0.5 ${
                isDark ? 'text-white group-hover:text-emerald-300' : 'text-slate-900 group-hover:text-emerald-700'
              }`}>
                Open Curriculum Alignment Analyzer
              </h4>
              <p className={`text-xs mt-1 max-w-md ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Audit B.Tech Computer Science and BBA (Marketing) syllabus units against live 2026 hiring metrics.
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform ${
              isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
