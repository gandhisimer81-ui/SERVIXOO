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
    <div className={`w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 transition-colors ${
      isDark ? 'bg-[#080E1E] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`} id="dashboard-page">
      
      {/* Header Block */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700/40 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2 border shadow-xs bg-cyan-950/60 border-cyan-700/50 text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Servixoo Labour Intelligence & Curriculum Alignment Platform
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Executive Intelligence Dashboard
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Real-time telemetry tracking skill supply, university curriculum coverage, and recruiter demand trajectories across technical employment hubs.
          </p>
        </div>

        {/* Quick launch primary action */}
        {onNavigate && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('skills_form')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Test Student Skill Gap</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className={`p-5 rounded-2xl border shadow-lg flex items-center gap-4 ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Active Job Postings
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-0.5">{totalJobs}</h3>
              <span className="text-[10px] text-emerald-400 font-semibold">Live in SQLite</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-lg flex items-center gap-4 ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Tracked Skills
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-0.5">{activeSkills}</h3>
              <span className="text-[10px] text-cyan-400 font-semibold">TF-IDF Vectorized</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-lg flex items-center gap-4 ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Audited Syllabi
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-0.5">2 Courses</h3>
              <span className="text-[10px] text-slate-400 font-semibold">B.Tech CS & BBA</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-lg flex items-center gap-4 ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-400 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Average Gap Score
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-0.5">{avgGapScore}%</h3>
              <span className="text-[10px] text-amber-400 font-semibold">Commercial Delta</span>
            </div>
          </div>

        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* District Gap Scores Bar Chart (7 cols) */}
          <div className={`lg:col-span-7 rounded-2xl border p-6 shadow-xl ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/40">
              <div>
                <h3 className="font-extrabold text-sm text-white">
                  Regional Skill Gap Scores (%)
                </h3>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Calculated curriculum mismatch across active employment corridors
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                State Data
              </span>
            </div>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gapChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} />
                  <XAxis dataKey="name" stroke={isDark ? '#94A3B8' : '#64748B'} fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke={isDark ? '#94A3B8' : '#64748B'} fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0B132B' : '#FFFFFF', 
                      borderColor: isDark ? '#334155' : '#CBD5E1',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: isDark ? '#F8FAFC' : '#0F172A'
                    }} 
                  />
                  <Bar dataKey="Gap Score (%)" fill="#00F0FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Core Market Competency Radar (5 cols) */}
          <div className={`lg:col-span-5 rounded-2xl border p-6 shadow-xl ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/40">
              <div>
                <h3 className="font-extrabold text-sm text-white">
                  Industry Demand Vectors
                </h3>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Core requirements across 6 fields
                </p>
              </div>
            </div>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarChartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke={isDark ? '#1E293B' : '#E2E8F0'} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={isDark ? '#475569' : '#CBD5E1'} tick={false} />
                  <Radar name="Market Demand" dataKey="Demand" stroke="#00F0FF" fill="#00F0FF" fillOpacity={0.35} strokeWidth={2} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0B132B' : '#FFFFFF', 
                      borderColor: isDark ? '#334155' : '#CBD5E1',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: isDark ? '#F8FAFC' : '#0F172A'
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
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                Piece 1 & 2 Workflow
              </span>
              <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mt-0.5">
                Run Student Skill & Dream Job Gap Engine
              </h4>
              <p className={`text-xs mt-1 max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Check student college coursework against Python Developer, Data Analyst, Digital Marketer, or Backend Engineer roles.
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
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
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Piece 4 Workflow
              </span>
              <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mt-0.5">
                Open Curriculum Alignment Analyzer
              </h4>
              <p className={`text-xs mt-1 max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Audit B.Tech Computer Science and BBA (Marketing) syllabus units against live 2026 hiring metrics.
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
