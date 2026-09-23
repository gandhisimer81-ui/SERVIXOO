import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Briefcase, TrendingUp, Cpu, GraduationCap, AlertCircle, TrendingDown, Minus } from 'lucide-react';
import { Job, Skill, District, Curriculum } from '../types';

export default function Dashboard() {
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

  if (loading) {
    return (
      <div className="flex-1 h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-semibold text-sm animate-pulse">Aggregating Labour Intelligence...</p>
      </div>
    );
  }

  // Calculations
  const totalJobs = jobs.length || 20;
  const activeSkills = skills.length || 18;
  const totalCurricula = curricula.length || 6;
  const avgGapScore = districts.length 
    ? Math.round(districts.reduce((sum, d) => sum + d.gap_score, 0) / districts.length)
    : 54;

  // Recharts Bar Data: Districts and their gap scores
  const gapChartData = districts.map(d => ({
    name: d.name.split(' ')[0] + ' ' + (d.name.split(' ')[1] || ''),
    'Gap Score (%)': d.gap_score
  }));

  // Recharts Radar Data: Skill Categories distribution
  const radarChartData = [
    { subject: 'AI/ML', A: 94, fullMark: 100 },
    { subject: 'Cloud/DevOps', A: 84, fullMark: 100 },
    { subject: 'Database', A: 75, fullMark: 100 },
    { subject: 'Programming', A: 74, fullMark: 100 },
    { subject: 'Frontend', A: 81, fullMark: 100 },
    { subject: 'Security', A: 91, fullMark: 100 },
  ];

  // Recharts Line Data: Local labour market growth trends
  const growthTrendData = [
    { month: 'Jan', Tech: 100, Healthcare: 100, Manufacturing: 100, 'Green Energy': 100 },
    { month: 'Feb', Tech: 105, Healthcare: 102, Manufacturing: 98, 'Green Energy': 108 },
    { month: 'Mar', Tech: 112, Healthcare: 104, Manufacturing: 101, 'Green Energy': 115 },
    { month: 'Apr', Tech: 110, Healthcare: 107, Manufacturing: 99, 'Green Energy': 122 },
    { month: 'May', Tech: 118, Healthcare: 111, Manufacturing: 103, 'Green Energy': 135 },
    { month: 'Jun', Tech: 125, Healthcare: 114, Manufacturing: 106, 'Green Energy': 148 },
    { month: 'Jul', Tech: 132, Healthcare: 118, Manufacturing: 108, 'Green Energy': 160 },
    { month: 'Aug', Tech: 138, Healthcare: 121, Manufacturing: 111, 'Green Energy': 172 },
    { month: 'Sep', Tech: 145, Healthcare: 125, Manufacturing: 114, 'Green Energy': 185 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Upper header */}
      <div className="flex flex-col gap-1 mb-8" id="dashboard-header">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Intelligence Dashboard</h2>
        <p className="text-slate-500 text-sm">Real-time regional skill-demand alignment metrics.</p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" id="dashboard-kpi-grid">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tracked Jobs</span>
            <span className="text-3xl font-bold text-slate-800 mt-1">{totalJobs}</span>
            <span className="text-[11px] text-emerald-600 font-medium mt-1">▲ 14% this month</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-violet-50 text-violet-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Monitored Skills</span>
            <span className="text-3xl font-bold text-slate-800 mt-1">{activeSkills}</span>
            <span className="text-[11px] text-emerald-600 font-medium mt-1">▲ 4 emerging tags</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg Skill Gap</span>
            <span className="text-3xl font-bold text-slate-800 mt-1">{avgGapScore}%</span>
            <span className="text-[11px] text-rose-500 font-medium mt-1">▼ 1.2% gap index</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Curricula Enrolled</span>
            <span className="text-3xl font-bold text-slate-800 mt-1">{totalCurricula}</span>
            <span className="text-[11px] text-slate-500 font-medium mt-1">6 major institutions</span>
          </div>
        </div>
      </div>

      {/* Labour Market Growth Trends (Line Graph) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8" id="dashboard-growth-trends-chart">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Local Labour Market Growth Trends</h3>
            <p className="text-xs text-slate-400 mt-0.5">Indexed monthly growth performance (Base: 100 in Jan)</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Market Feed Active
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[90, 200]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
              <Line type="monotone" dataKey="Tech" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Healthcare" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Manufacturing" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Green Energy" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" id="dashboard-charts-grid">
        {/* Alignment gap by district (Bar Chart) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Regional Curricula Misalignment Index</h3>
              <p className="text-xs text-slate-400 mt-0.5">Higher score indicates larger skills gap</p>
            </div>
            <span className="text-xs font-semibold bg-rose-500/10 text-rose-600 px-2.5 py-1 rounded-full border border-rose-500/10">District Drilldown</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="Gap Score (%)" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Demand Radar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">In-Demand Skill Sectors</h3>
            <p className="text-xs text-slate-400 mt-0.5">Average regional hiring density by domain</p>
          </div>
          <div className="h-64 w-full mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Hiring Intensity" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lists Row: Trending Skills & Highest Gap Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-lists-row">
        {/* List 1: Top Trending Skills */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 text-base">Trending Market Skills</h3>
            <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">View All</span>
          </div>
          <div className="flex flex-col gap-3.5">
            {skills.slice(0, 5).map((skill) => (
              <div key={skill.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 rounded-full bg-indigo-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">{skill.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{skill.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-800">{skill.demand_score}%</span>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Demand Score</span>
                  </div>
                  <div>
                    {skill.trend_direction === 'UP' && (
                      <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center gap-1 text-[10px] font-bold">
                        <TrendingUp className="w-3.5 h-3.5" /> UP
                      </span>
                    )}
                    {skill.trend_direction === 'DOWN' && (
                      <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 flex items-center gap-1 text-[10px] font-bold">
                        <TrendingDown className="w-3.5 h-3.5" /> DOWN
                      </span>
                    )}
                    {skill.trend_direction === 'STABLE' && (
                      <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600 flex items-center gap-1 text-[10px] font-bold">
                        <Minus className="w-3.5 h-3.5" /> STABLE
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* List 2: Highest Misalignment Zones */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 text-base">Highest Misalignment Zones</h3>
            <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">Maps</span>
          </div>
          <div className="flex flex-col gap-3.5">
            {districts.slice(0, 5).map((dist) => (
              <div key={dist.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg font-bold text-xs ${
                    dist.gap_score > 60 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {dist.gap_score}%
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">{dist.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[280px]">
                      Top Needs: {dist.top_demand_skills}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                  dist.gap_score > 60 ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {dist.gap_score > 60 ? 'CRITICAL GAP' : 'MODERATE GAP'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
