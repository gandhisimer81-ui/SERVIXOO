import { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  RotateCcw, 
  Briefcase, 
  BookOpen, 
  Layers, 
  Compass, 
  Award,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';
import ThreeSkillGalaxy from '../components/ThreeSkillGalaxy';

// The exact 4 dream-job roles requested by prompt
const DREAM_JOB_ROLES = [
  'Python Developer',
  'Data Analyst',
  'Digital Marketer',
  'Backend Engineer'
] as const;

// Preset college skills for the checklist
const COLLEGE_SKILLS_CHECKLIST = [
  'MS Excel',
  'Python',
  'C',
  'SQL',
  'DSA',
  'Communication',
  'Java',
  'HTML & CSS',
  'Git'
];

interface RadarCategory {
  category: string;
  market_demand: number;
  student_score: number;
}

interface AIRoadmap {
  gap_summary: string;
  bridge_strategy: string;
  milestones: string[];
  avoid_list: string[];
  checklist: string[];
}

interface AnalysisResult {
  readiness_score: number;
  matched_skills: string[];
  missing_skills: string[];
  radar_categories: RadarCategory[];
  ai_roadmap: AIRoadmap;
  cosine_similarity?: number;
  method?: string;
  target_role: string;
}

export default function StudentReadinessFlow() {
  // Step 1: Form state
  const [selectedDreamJob, setSelectedDreamJob] = useState<string>('Python Developer');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Python', 'C', 'SQL', 'DSA']);
  const [customText, setCustomText] = useState<string>('');

  // Execution states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Accordion toggle for roadmap
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    reality: true,
    bridge: true,
    milestones: true,
    avoid: true,
    checklist: true
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    // Merge checklist skills and free-text custom skills
    const freeTextSkills = customText
      .split(/[,;\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const combinedSkills = Array.from(new Set([...selectedSkills, ...freeTextSkills]));

    if (combinedSkills.length === 0) {
      setErrorMsg('Please select at least one skill learned in college or type your skills in the field.');
      setIsAnalyzing(false);
      return;
    }

    try {
      const response = await fetch('/api/student/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collegeSkills: combinedSkills,
          dreamJob: selectedDreamJob,
          customInput: customText
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed with status ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'An error occurred while computing the readiness score.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!analysisResult) return;
    setIsDownloadingPdf(true);
    try {
      const res = await fetch('/api/student/download-pdf');
      if (!res.ok) {
        throw new Error('Could not download PDF from server.');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Servixoo_Readiness_Report_${selectedDreamJob.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('PDF Download failed:', err);
      alert(`Could not download PDF: ${err.message}`);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8" id="student-readiness-flow">
      {/* Platform Intro Banner */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-semibold mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Hackathon Scope • Real Scikit-learn Cosine Similarity
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Student Career Readiness & AI Curriculum Alignment
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Evaluate your university coursework against live labour market demands. Computes real cosine similarity scores, identifies missing market gaps, and constructs your non-linear transition roadmap.
          </p>
        </div>

        {analysisResult && (
          <button
            onClick={() => setAnalysisResult(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Re-run Assessment
          </button>
        )}
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* PIECE 1: Student Skill & Dream Job Form */}
        <section className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Student Skill & Dream Job Input</h2>
              <p className="text-xs text-slate-400">Specify what you learned in college and select your target commercial role.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dream Job Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                Target Dream Job Title
              </label>
              <select
                value={selectedDreamJob}
                onChange={(e) => setSelectedDreamJob(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer font-medium"
              >
                {DREAM_JOB_ROLES.map((role) => (
                  <option key={role} value={role} className="bg-slate-900 text-white">
                    {role}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                Locked to 4 hackathon roles: Python Developer, Data Analyst, Digital Marketer, Backend Engineer.
              </p>
            </div>

            {/* Checklist description */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                What You Learned in College (Checklist)
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {COLLEGE_SKILLS_CHECKLIST.map((skill) => {
                  const isChecked = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <span>{isChecked ? '✔' : '+'}</span>
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Free-text input field */}
          <div className="mt-5 space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Additional College Subjects / Free-Text Skills
            </label>
            <textarea
              rows={2}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Computer Networks, Microprocessors 8085, Object Oriented C++, Relational Normalization, Operating Systems..."
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-xs"
            />
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Computing Real Cosine Similarity...</span>
                </>
              ) : (
                <>
                  <span>Calculate Real Readiness & Roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* PIECES 2, 3, 5: Readiness Report Screen */}
        {analysisResult && (
          <div className="space-y-8 animate-fadeIn" id="readiness-report-view">
            {/* Top Score Banner + Circular Progress Ring */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1: Circular Progress Ring & Readiness Score */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-400" />
                  Calculated Readiness Score
                </span>

                {/* Animated Circular SVG Ring */}
                <div className="relative w-44 h-44 flex items-center justify-center my-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      stroke="#1e293b"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      stroke={analysisResult.readiness_score >= 65 ? '#10b981' : (analysisResult.readiness_score >= 40 ? '#f59e0b' : '#ef4444')}
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - analysisResult.readiness_score / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold text-white tracking-tight">
                      {analysisResult.readiness_score}%
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                      {analysisResult.readiness_score >= 70 ? 'Job Ready' : (analysisResult.readiness_score >= 40 ? 'Bridgeable' : 'Deficit')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 w-full text-center">
                  <p className="text-xs text-slate-400">
                    Computed via <span className="text-blue-400 font-mono font-medium">Scikit-learn TF-IDF Cosine Similarity</span> against {selectedDreamJob} expectations.
                  </p>
                  {analysisResult.cosine_similarity !== undefined && (
                    <span className="inline-block mt-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                      Vector Cosine Sim: {analysisResult.cosine_similarity}
                    </span>
                  )}
                </div>
              </div>

              {/* Card 2: Two Clearly Separated Lists (Matched vs Missing) */}
              <div className="lg:col-span-2 bg-slate-950/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Labour Market Skills Breakdown
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Clear separation between verified strengths and high-priority upskilling targets for {selectedDreamJob}.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Matched Skills List */}
                    <div className="bg-slate-900/80 border border-emerald-900/40 rounded-2xl p-4 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Matched Skills ({analysisResult.matched_skills.length})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">Taught in your coursework and valued in production.</p>
                      <div className="flex flex-wrap gap-1.5 flex-1 content-start">
                        {analysisResult.matched_skills.length > 0 ? (
                          analysisResult.matched_skills.map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-medium"
                            >
                              ✔ {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No direct matches identified yet.</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Skills List (Ranked by Importance) */}
                    <div className="bg-slate-900/80 border border-amber-900/40 rounded-2xl p-4 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                          <XCircle className="w-4 h-4 text-amber-400" />
                          Missing Skills ({analysisResult.missing_skills.length})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">Ranked by hiring demand importance.</p>
                      <div className="flex flex-wrap gap-1.5 flex-1 content-start">
                        {analysisResult.missing_skills.length > 0 ? (
                          analysisResult.missing_skills.map((s, idx) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-700/60 text-amber-300 text-xs font-medium flex items-center gap-1"
                            >
                              <span className="text-[10px] text-amber-400/70 font-mono">#{idx + 1}</span>
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-400 italic">100% matched! No missing skills.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PDF Download CTA */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Download genuine Python ReportLab PDF with complete analysis & roadmap.</span>
                  </div>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isDownloadingPdf ? 'Generating Real PDF...' : 'Download PDF Report'}
                  </button>
                </div>
              </div>
            </div>

            {/* Radar / Spider Chart & Three.js Visualizer Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar/Spider Chart (Student vs Market Demand) */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
                <div className="mb-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-400" />
                    Radar Competency Benchmark
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comparing Student Coursework Profile against Active Market Demand across 5 categories.
                  </p>
                </div>

                <div className="w-full h-80 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={analysisResult.radar_categories || []} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                      <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="category" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Radar
                        name="Student Score"
                        dataKey="student_score"
                        stroke="#38bdf8"
                        fill="#38bdf8"
                        fillOpacity={0.45}
                      />
                      <Radar
                        name="Market Demand"
                        dataKey="market_demand"
                        stroke="#f43f5e"
                        fill="#f43f5e"
                        fillOpacity={0.2}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                        itemStyle={{ fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-2 text-center text-[11px] text-slate-500">
                  Blue Area: Student Competency • Crimson Line: Industry Baseline Demand
                </div>
              </div>

              {/* PIECE 5: Polished Interactive Three.js Visual */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Interactive 3D Skill Visualizer
                    </h3>
                    <p className="text-xs text-slate-400">
                      Drag to rotate • Scroll to zoom • Click any node to view skill specifics
                    </p>
                  </div>
                </div>

                <div className="flex-1 min-h-[320px]">
                  <ThreeSkillGalaxy
                    matchedSkills={analysisResult.matched_skills}
                    missingSkills={analysisResult.missing_skills}
                    targetRole={selectedDreamJob}
                    readinessScore={analysisResult.readiness_score}
                  />
                </div>
              </div>
            </div>

            {/* PIECE 3: 5-Section AI Career Architect Roadmap */}
            <section className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-950 border border-indigo-800/60 text-indigo-300 text-[11px] font-semibold mb-1">
                    AI Career Architect • 5-Section Transition Plan
                  </div>
                  <h3 className="text-lg font-bold text-white">Dynamic Skill-Gap Transition Strategy</h3>
                  <p className="text-xs text-slate-400">
                    Targeting {selectedDreamJob} with custom college curriculum bridge.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* 1. Reality Check */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                  <button
                    onClick={() => toggleSection('reality')}
                    className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-900/90 hover:bg-slate-850 text-left transition-all"
                  >
                    <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">1</span>
                      Reality Check (The Gap)
                    </span>
                    {openSections.reality ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openSections.reality && (
                    <div className="px-5 py-4 text-xs text-slate-300 border-t border-slate-800 leading-relaxed bg-slate-950/50">
                      {analysisResult.ai_roadmap?.gap_summary || 'Analysis indicates substantial deficit in production framework integration.'}
                    </div>
                  )}
                </div>

                {/* 2. Bridge Strategy */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                  <button
                    onClick={() => toggleSection('bridge')}
                    className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-900/90 hover:bg-slate-850 text-left transition-all"
                  >
                    <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">2</span>
                      Bridge Strategy
                    </span>
                    {openSections.bridge ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openSections.bridge && (
                    <div className="px-5 py-4 text-xs text-slate-300 border-t border-slate-800 leading-relaxed bg-slate-950/50">
                      {analysisResult.ai_roadmap?.bridge_strategy || 'Map foundational algorithmic concepts into high-level dynamic syntax.'}
                    </div>
                  )}
                </div>

                {/* 3. Accelerated Non-Linear Roadmap */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                  <button
                    onClick={() => toggleSection('milestones')}
                    className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-900/90 hover:bg-slate-850 text-left transition-all"
                  >
                    <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">3</span>
                      Accelerated Non-Linear Roadmap
                    </span>
                    {openSections.milestones ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openSections.milestones && (
                    <div className="px-5 py-4 text-xs text-slate-300 border-t border-slate-800 space-y-2.5 bg-slate-950/50">
                      {analysisResult.ai_roadmap?.milestones?.map((m, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-700/60 text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{m}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. What NOT to Do */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                  <button
                    onClick={() => toggleSection('avoid')}
                    className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-900/90 hover:bg-slate-850 text-left transition-all"
                  >
                    <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">4</span>
                      What NOT to Do (Legacy Topics to Stop)
                    </span>
                    {openSections.avoid ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openSections.avoid && (
                    <div className="px-5 py-4 text-xs text-slate-300 border-t border-slate-800 space-y-2 bg-slate-950/50">
                      {analysisResult.ai_roadmap?.avoid_list?.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 text-amber-300/90">
                          <span className="shrink-0 mt-0.5">⚠️</span>
                          <span className="leading-relaxed">{a}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Job-Readiness Checklist */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                  <button
                    onClick={() => toggleSection('checklist')}
                    className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-900/90 hover:bg-slate-850 text-left transition-all"
                  >
                    <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">5</span>
                      Job-Readiness Checklist & Tool Portfolio
                    </span>
                    {openSections.checklist ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openSections.checklist && (
                    <div className="px-5 py-4 text-xs text-slate-300 border-t border-slate-800 space-y-2 bg-slate-950/50">
                      {analysisResult.ai_roadmap?.checklist?.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 text-emerald-300/90">
                          <span className="shrink-0 mt-0.5">✔</span>
                          <span className="leading-relaxed">{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom PDF Download Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isDownloadingPdf ? 'Compiling ReportLab PDF...' : 'Download Official PDF Career Report'}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
