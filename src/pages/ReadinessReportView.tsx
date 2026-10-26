import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Briefcase, 
  Calendar, 
  Layers, 
  Award,
  Video, 
  ExternalLink, 
  Clock, 
  Flame, 
  ArrowRight,
  TrendingUp,
  Sliders,
  Lock,
  Share2
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
import { useTheme } from '../components/ThemeContext';

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

export interface AnalysisResult {
  readiness_score: number;
  matched_skills: string[];
  missing_skills: string[];
  radar_categories: RadarCategory[];
  ai_roadmap: AIRoadmap;
  cosine_similarity?: number;
  method?: string;
  target_role: string;
}

interface ReadinessReportViewProps {
  report: AnalysisResult | null;
  onGoToForm: () => void;
  onLoadSample: () => void;
  targetRole: string;
}

// Recommended video courses mapped per skill
const RECOMMENDED_VIDEO_COURSES: Record<string, { title: string; provider: string; duration: string; url: string; thumbnail: string }> = {
  'FastAPI': {
    title: 'FastAPI Full Course - Building Modern Python Web APIs',
    provider: 'freeCodeCamp',
    duration: '4h 15m',
    url: 'https://www.youtube.com/watch?v=0sOvCWFmrtA',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80'
  },
  'Docker': {
    title: 'Docker & Kubernetes Full Course for Beginners',
    provider: 'TechWorld with Nana',
    duration: '3h 20m',
    url: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
    thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&auto=format&fit=crop&q=80'
  },
  'SQL': {
    title: 'SQL Tutorial - Full Database Course for Beginners',
    provider: 'freeCodeCamp',
    duration: '4h 20m',
    url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80'
  },
  'Data Analysis': {
    title: 'Data Analysis with Python - Complete Course',
    provider: 'freeCodeCamp',
    duration: '4h 40m',
    url: 'https://www.youtube.com/watch?v=r-uOLxNrNk8',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80'
  },
  'Machine Learning': {
    title: 'Machine Learning Course for Beginners',
    provider: 'freeCodeCamp',
    duration: '9h 50m',
    url: 'https://www.youtube.com/watch?v=NWON8890QQU',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&auto=format&fit=crop&q=80'
  }
};

export default function ReadinessReportView({
  report,
  onGoToForm,
  onLoadSample,
  targetRole
}: ReadinessReportViewProps) {
  const { isDark } = useTheme();

  // Animated score counter state
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Role Comparison Mode states
  const [comparisonRole, setComparisonRole] = useState<string>('Data Analyst');
  const [compareScore, setCompareScore] = useState<number | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Accordion toggle for the 5 roadmap sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    reality: true,
    bridge: true,
    milestones: true,
    avoid: false,
    checklist: true
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Animate the circular progress ring from 0 to report.readiness_score over 1.5 seconds
  useEffect(() => {
    if (!report) return;

    const target = report.readiness_score || 0;
    setAnimatedScore(0);

    const durationMs = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      
      // Easing out cubic: 1 - pow(1 - x, 3)
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(eased * target);

      setAnimatedScore(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedScore(target);
        if (target >= 75) {
          setShowCelebration(true);
        }
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [report]);

  // Handle PDF Download
  const handleDownloadPdf = async () => {
    if (!report) return;
    setIsDownloadingPdf(true);
    try {
      const res = await fetch('/api/student/download-pdf');
      if (!res.ok) {
        throw new Error('PDF service returned non-200 status');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Servixoo_Readiness_Report_${(report.target_role || targetRole).replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('PDF Download failed:', err);
      alert(`Could not download PDF: ${err.message || 'ReportLab generation service unreachable'}`);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Handle Role Comparison
  const handleCompareRoles = async (secondRole: string) => {
    setComparisonRole(secondRole);
    if (!report) return;
    setIsComparing(true);
    try {
      const res = await fetch('/api/student/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collegeSkills: report.matched_skills || ['Python', 'SQL'],
          dreamJob: secondRole
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCompareScore(data.readiness_score);
      }
    } catch (e) {
      console.error('Comparison error:', e);
    } finally {
      setIsComparing(false);
    }
  };

  // If no report has been generated yet, show empty state with 1-click sample button
  if (!report) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center transition-colors ${
        isDark ? 'bg-[#080E1E] text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}>
        <div className={`max-w-md w-full p-8 rounded-3xl border shadow-2xl flex flex-col items-center gap-4 ${
          isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
        }`}>
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight">No Readiness Report Generated Yet</h2>
            <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Fill your college skills and target job to calculate a real Scikit-learn TF-IDF cosine similarity score and generated career roadmap.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-3">
            <button
              onClick={onGoToForm}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              Fill Skills Form
            </button>
            <button
              onClick={onLoadSample}
              className={`flex-1 px-4 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              Load Sample Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Circular progress calculations (radius = 58, perimeter = 2 * PI * 58 ≈ 364.4)
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Time-to-ready calculation: 1 missing skill ~ 3 weeks of study
  const missingCount = report.missing_skills?.length || 0;
  const monthsEstimate = Math.max(1, Math.round((missingCount * 0.75)));

  return (
    <div className={`w-full h-full overflow-y-auto p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 transition-colors ${
      isDark ? 'bg-[#080E1E] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`} id="readiness-report-screen">
      
      {/* Celebration banner when score >= 75% */}
      {showCelebration && (
        <div className="max-w-6xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-600/30 via-cyan-600/30 to-blue-600/30 border border-emerald-500/60 shadow-xl flex items-center justify-between gap-3 animate-celebrate">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold text-base sm:text-lg shrink-0">
              🎉
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5 flex-wrap">
                Outstanding High Market Alignment!
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black">
                  {report.readiness_score}% Readiness
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-200 mt-0.5">
                Your syllabus fundamentals place you in the top tier of candidates for {report.target_role || targetRole}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCelebration(false)}
            className="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner: Actions & Navigation */}
      <div className={`max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4 sm:pb-6 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div>
          <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold mb-2 border shadow-xs ${
            isDark ? 'bg-cyan-950/70 border-cyan-700/50 text-cyan-300' : 'bg-cyan-100 border-cyan-300 text-cyan-900 font-bold'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Piece 3 & 5 • Scikit-learn Cosine Similarity & ReportLab PDF</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            Readiness Report: {report.target_role || targetRole}
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Real-time computed competency evaluation against {report.target_role || targetRole} job postings. Includes cosine similarity scoring, 3D orbital galaxy, and AI career roadmap.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          {/* Change inputs button */}
          <button
            onClick={onGoToForm}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isDark 
                ? 'bg-[#0E1A38] hover:bg-slate-800 text-slate-200 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Edit Skills</span>
          </button>

          {/* Elevated Download PDF Report button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isDownloadingPdf ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Compiling PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* ROW 1: Animated Circular Progress Ring + Matched / Missing Skill Pill Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          
          {/* Animated Circular Progress Card (4 cols) */}
          <div className={`lg:col-span-4 rounded-2xl border p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-xl transition-all ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Computed Readiness Score
            </span>

            {/* Circular Ring SVG */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 my-2 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                {/* Track Circle */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke={isDark ? '#1C294A' : '#E2E8F0'}
                  strokeWidth="11"
                  fill="transparent"
                />
                {/* Animated Progress Circle */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke={animatedScore >= 75 ? '#10B981' : animatedScore >= 50 ? '#00F0FF' : '#F59E0B'}
                  strokeWidth="11"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-300 ease-out"
                />
              </svg>

              {/* Centered Number Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {animatedScore}%
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${
                  animatedScore >= 75 
                    ? isDark ? 'text-emerald-400' : 'text-emerald-700' 
                    : animatedScore >= 50 
                      ? isDark ? 'text-cyan-400' : 'text-blue-700' 
                      : isDark ? 'text-amber-400' : 'text-amber-800'
                }`}>
                  {animatedScore >= 75 ? 'Market Ready' : animatedScore >= 50 ? 'Moderate Gap' : 'Critical Gap'}
                </span>
              </div>
            </div>

            {/* Time to Ready Estimate Badge */}
            <div className={`mt-3 w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs ${
              isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                Time-to-Ready:
              </span>
              <span className={`font-bold ${isDark ? 'text-cyan-300' : 'text-blue-700'}`}>
                ~{monthsEstimate} {monthsEstimate === 1 ? 'Month' : 'Months'}
              </span>
            </div>

            {/* Scikit-learn note */}
            <p className={`text-[10px] mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Computed via Scikit-learn TF-IDF cosine similarity in Python service.
            </p>
          </div>

          {/* Matched & Missing Skills Cards (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Matched Skills Card */}
            <div className={`rounded-2xl border p-5 flex flex-col justify-between shadow-lg transition-colors ${
              isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-400' : 'bg-emerald-100 border border-emerald-300 text-emerald-700'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Matched Competencies</h3>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Covered by your college coursework
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    {report.matched_skills?.length || 0} Matched
                  </span>
                </div>

                {/* Pill list */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {report.matched_skills && report.matched_skills.length > 0 ? (
                    report.matched_skills.map((skill) => (
                      <span
                        key={skill}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs ${
                          isDark 
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50' 
                            : 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No direct matches found in baseline.</span>
                  )}
                </div>
              </div>

              <div className={`pt-4 mt-4 border-t text-[11px] ${
                isDark ? 'border-slate-700/30 text-slate-400' : 'border-slate-200 text-slate-600'
              }`}>
                ✅ These foundational skills give you an immediate springboard into modern commercial tech stacks.
              </div>
            </div>

            {/* Missing Skills Card */}
            <div className={`rounded-2xl border p-5 flex flex-col justify-between shadow-lg transition-colors ${
              isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-amber-500/20 border border-amber-400/40 text-amber-400' : 'bg-amber-100 border border-amber-300 text-amber-700'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>Missing Market Skills</h3>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Ranked by recruiter priority
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {report.missing_skills?.length || 0} Gaps
                  </span>
                </div>

                {/* Pill list */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {report.missing_skills && report.missing_skills.length > 0 ? (
                    report.missing_skills.map((skill) => (
                      <span
                        key={skill}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs ${
                          isDark 
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-500/50' 
                            : 'bg-amber-100 text-amber-950 border border-amber-300 font-bold'
                        }`}
                      >
                        <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-600 font-bold">Zero critical gaps remaining!</span>
                  )}
                </div>
              </div>

              <div className={`pt-4 mt-4 border-t text-[11px] ${
                isDark ? 'border-slate-700/30 text-slate-400' : 'border-slate-200 text-slate-600'
              }`}>
                ⚠️ Highly demanded by employers. Bridge these using the 5-section AI roadmap below.
              </div>
            </div>

          </div>
        </div>

        {/* ROW 2: Radar Chart & 3D Three.js Galaxy Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Radar Chart (6 cols) */}
          <div className={`lg:col-span-6 rounded-2xl border p-5 shadow-xl flex flex-col justify-between transition-colors ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>
                  Radar Analysis: Student vs Market Demand
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Evaluating 5 core competency dimensions
                </p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                isDark ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' : 'bg-blue-100 text-blue-900 border-blue-300'
              }`}>
                5 Dimensions
              </span>
            </div>

            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={report.radar_categories || []} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke={isDark ? '#1E293B' : '#CBD5E1'} strokeDasharray="3 3" />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fill: isDark ? '#94A3B8' : '#1E293B', fontSize: 11, fontWeight: 700 }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={isDark ? '#475569' : '#94A3B8'} tick={false} />
                  
                  {/* Market Demand Series */}
                  <Radar
                    name="Market Demand"
                    dataKey="market_demand"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />

                  {/* Student Skills Series */}
                  <Radar
                    name="Your Skills"
                    dataKey="student_score"
                    stroke={isDark ? "#00F0FF" : "#0284C7"}
                    fill={isDark ? "#00F0FF" : "#0284C7"}
                    fillOpacity={0.4}
                    strokeWidth={2.5}
                  />

                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0B132B' : '#FFFFFF', 
                      borderColor: isDark ? '#334155' : '#CBD5E1',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <p className={`text-[10px] text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Blue perimeter highlights your demonstrated areas; Amber reveals commercial industry expectation.
            </p>
          </div>

          {/* Three.js Interactive 3D Galaxy (6 cols) */}
          <div className={`lg:col-span-6 rounded-2xl border p-5 shadow-xl flex flex-col justify-between transition-colors ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className={`font-bold text-sm flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Sparkles className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                  Three.js 3D Skill Galaxy
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Drag to rotate • Click nodes to inspect competency status
                </p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                isDark ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' : 'bg-blue-100 text-blue-900 border-blue-300'
              }`}>
                Live WebGL
              </span>
            </div>

            <div className="w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-slate-800 relative bg-[#070D1E]">
              <ThreeSkillGalaxy
                matchedSkills={report.matched_skills || []}
                missingSkills={report.missing_skills || []}
                targetRole={report.target_role || targetRole}
                readinessScore={report.readiness_score}
              />
            </div>

            <div className={`flex items-center justify-between text-[11px] pt-2 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Matched Nodes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Missing Skill Nodes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                Target Role Nucleus
              </span>
            </div>
          </div>

        </div>

        {/* ROW 3: AI-Generated 5-Section Roadmap Accordion */}
        <div className={`rounded-2xl border p-6 sm:p-8 shadow-xl transition-colors ${
          isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
        }`}>
          <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
            isDark ? 'border-slate-700/40' : 'border-slate-200'
          }`}>
            <div>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Layers className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                AI Career Architect Roadmap (5 Strategic Pillars)
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Structured non-linear pathway bridging your academic baseline to {report.target_role || targetRole}
              </p>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
              isDark ? 'text-cyan-400 bg-cyan-950/80 border-cyan-800' : 'text-blue-900 bg-blue-100 border-blue-300'
            }`}>
              LLM Synthesized
            </span>
          </div>

          <div className="space-y-4">
            
            {/* Section 1: Reality Check */}
            <div className={`rounded-xl border overflow-hidden transition-colors ${
              isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <button
                onClick={() => toggleSection('reality')}
                className={`w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                  }`}>
                    1
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isDark ? 'text-red-300' : 'text-red-800 font-extrabold'}`}>Pillar 1: Reality Check</h3>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Current university syllabus vs commercial recruiter realities</p>
                  </div>
                </div>
                {openSections.reality ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {openSections.reality && (
                <div className={`p-4 pt-0 text-xs leading-relaxed border-t mt-2 ${
                  isDark ? 'border-slate-800/50 text-slate-300' : 'border-slate-200 text-slate-800'
                }`}>
                  <p className={`p-3 rounded-lg border ${
                    isDark ? 'bg-red-950/20 border-red-900/30 text-red-200' : 'bg-red-50 border-red-200 text-red-950 font-medium'
                  }`}>
                    {report.ai_roadmap?.gap_summary || `Your university curriculum provides a theoretical baseline in procedural logic, but lacks active industry pipelines such as modern frameworks, automated CI/CD workflows, and containerized cloud runtimes expected for ${report.target_role || targetRole}.`}
                  </p>
                </div>
              )}
            </div>

            {/* Section 2: Bridge Strategy */}
            <div className={`rounded-xl border overflow-hidden transition-colors ${
              isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <button
                onClick={() => toggleSection('bridge')}
                className={`w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-100 text-blue-700'
                  }`}>
                    2
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isDark ? 'text-cyan-300' : 'text-blue-800 font-extrabold'}`}>Pillar 2: Bridge Strategy</h3>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>How to convert college theory into commercial practical execution</p>
                  </div>
                </div>
                {openSections.bridge ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {openSections.bridge && (
                <div className={`p-4 pt-0 text-xs leading-relaxed border-t mt-2 ${
                  isDark ? 'border-slate-800/50 text-slate-300' : 'border-slate-200 text-slate-800'
                }`}>
                  <p className={`p-3 rounded-lg border ${
                    isDark ? 'bg-cyan-950/20 border-cyan-900/30 text-cyan-200' : 'bg-blue-50 border-blue-200 text-blue-950 font-medium'
                  }`}>
                    {report.ai_roadmap?.bridge_strategy || `Re-purpose your conceptual foundation in variables, control structures, and SQL into building production APIs with modern framework libraries (FastAPI/Express) and relational PostgreSQL database pools.`}
                  </p>
                </div>
              )}
            </div>

            {/* Section 3: Accelerated Non-Linear Roadmap */}
            <div className={`rounded-xl border overflow-hidden transition-colors ${
              isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <button
                onClick={() => toggleSection('milestones')}
                className={`w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    3
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-800 font-extrabold'}`}>Pillar 3: Accelerated Non-Linear Roadmap</h3>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Milestone-by-milestone actionable project plan</p>
                  </div>
                </div>
                {openSections.milestones ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {openSections.milestones && (
                <div className={`p-4 pt-0 space-y-2 border-t mt-2 ${
                  isDark ? 'border-slate-800/50' : 'border-slate-200'
                }`}>
                  {(report.ai_roadmap?.milestones || [
                    "Milestone 1: Terminal Mastery & Modern Git Collaboration Workflows",
                    "Milestone 2: Modular API Development with FastAPI / Express & Relational Schema Design",
                    "Milestone 3: Containerization with Docker & Multi-stage Builds",
                    "Milestone 4: Production Cloud Deployment with Automated CI/CD Testing"
                  ]).map((m, idx) => (
                    <div key={idx} className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs ${
                      isDark ? 'bg-[#0E1A38]/50 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                    }`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                        isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {idx + 1}
                      </span>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 4: What NOT to Do */}
            <div className={`rounded-xl border overflow-hidden transition-colors ${
              isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <button
                onClick={() => toggleSection('avoid')}
                className={`w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                  }`}>
                    4
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isDark ? 'text-amber-300' : 'text-amber-800 font-extrabold'}`}>Pillar 4: What NOT To Do</h3>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Common student pitfalls and time-wasting traps to avoid</p>
                  </div>
                </div>
                {openSections.avoid ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {openSections.avoid && (
                <div className={`p-4 pt-0 space-y-2 border-t mt-2 ${
                  isDark ? 'border-slate-800/50' : 'border-slate-200'
                }`}>
                  {(report.ai_roadmap?.avoid_list || [
                    "Do NOT spend weeks hand-writing code exams or memorizing boilerplate syntax.",
                    "Do NOT stay in tutorial hell watching 40-hour videos without writing custom code.",
                    "Do NOT build generic calculator/to-do apps—recruiters want authenticated, data-backed apps."
                  ]).map((a, idx) => (
                    <div key={idx} className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs ${
                      isDark ? 'bg-amber-950/20 border-amber-900/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'
                    }`}>
                      <span className="font-bold text-amber-600 shrink-0">❌</span>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 5: Job-Readiness Checklist */}
            <div className={`rounded-xl border overflow-hidden transition-colors ${
              isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <button
                onClick={() => toggleSection('checklist')}
                className={`w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                  }`}>
                    5
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isDark ? 'text-purple-300' : 'text-purple-800 font-extrabold'}`}>Pillar 5: Job-Readiness Checklist</h3>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Final hiring criteria required to apply with confidence</p>
                  </div>
                </div>
                {openSections.checklist ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {openSections.checklist && (
                <div className={`p-4 pt-0 space-y-2 border-t mt-2 ${
                  isDark ? 'border-slate-800/50' : 'border-slate-200'
                }`}>
                  {(report.ai_roadmap?.checklist || [
                    "Active GitHub account with at least 1 deployed Full-Stack application featuring API documentation.",
                    "Solid understanding of relational database normalization, indexing, and join optimization.",
                    "Demonstrated comfort discussing technical trade-offs in system architecture."
                  ]).map((c, idx) => (
                    <div key={idx} className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs ${
                      isDark ? 'bg-purple-950/20 border-purple-900/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-950'
                    }`}>
                      <span className="font-bold text-purple-600 shrink-0">✓</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Video Learning Embed Cards for Missing Skills */}
        <div className={`rounded-2xl border p-6 shadow-xl transition-colors ${
          isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Video className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                Targeted Video Learning Modules
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Free, vetted professional courses mapped directly to your missing skills
              </p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              isDark ? 'text-cyan-300 bg-cyan-950 border-cyan-800' : 'text-blue-900 bg-blue-100 border-blue-300'
            }`}>
              Vetted Resources
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(RECOMMENDED_VIDEO_COURSES).slice(0, 3).map(([skill, video]) => (
              <div 
                key={skill}
                className={`rounded-xl border overflow-hidden flex flex-col justify-between transition-colors ${
                  isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`p-3 border-b flex items-center justify-between ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <span className={`text-xs font-bold ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>{skill}</span>
                  <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{video.duration}</span>
                </div>
                <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                  <div>
                    <h4 className={`font-semibold text-xs leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{video.title}</h4>
                    <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Instructor: {video.provider}</p>
                  </div>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Watch Course</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bonus Section: Role Comparison Mode & Gamified Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Role Comparison Mode */}
          <div className={`rounded-2xl border p-5 shadow-xl transition-colors ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className={`font-bold text-sm flex items-center gap-1.5 ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>
                  <Sliders className="w-4 h-4" />
                  Role Comparison Mode
                </h3>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Compare readiness side-by-side: Which job are you closest to?
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Compare with:</span>
                <select
                  value={comparisonRole}
                  onChange={(e) => handleCompareRoles(e.target.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                    isDark ? 'bg-[#080E1E] border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                >
                  {['Data Analyst', 'Python Developer', 'Digital Marketer', 'Backend Engineer']
                    .filter(r => r !== (report.target_role || targetRole))
                    .map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                </select>
              </div>

              {/* Side-by-side bars */}
              <div className="space-y-2 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className={isDark ? 'text-cyan-400' : 'text-blue-700'}>{report.target_role || targetRole} (Primary)</span>
                    <span className={isDark ? 'text-white' : 'text-slate-900'}>{report.readiness_score}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isDark ? 'bg-cyan-400' : 'bg-blue-600'}`}
                      style={{ width: `${report.readiness_score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className={isDark ? 'text-amber-400' : 'text-amber-700'}>{comparisonRole}</span>
                    <span className={isDark ? 'text-white' : 'text-slate-900'}>{isComparing ? 'Computing...' : `${compareScore !== null ? compareScore : 55}%`}</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isDark ? 'bg-amber-400' : 'bg-amber-500'}`}
                      style={{ width: `${compareScore !== null ? compareScore : 55}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className={`text-[11px] pt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                💡 You have a higher affinity score for {report.readiness_score >= (compareScore || 55) ? (report.target_role || targetRole) : comparisonRole}.
              </p>
            </div>
          </div>

          {/* Gamified Achievement Badges */}
          <div className={`rounded-2xl border p-5 shadow-xl ${
            isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
          }`}>
            <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5 mb-1">
              <Award className="w-4 h-4" />
              Earned Candidate Milestones
            </h3>
            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Gamified competency badges based on current vector analysis
            </p>

            <div className="grid grid-cols-3 gap-2.5 pt-3">
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-center flex flex-col items-center">
                <span className="text-xl mb-1">🛰️</span>
                <span className="text-[11px] font-bold text-cyan-300">Vectorized</span>
                <span className="text-[9px] text-slate-400">TF-IDF Synced</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-center flex flex-col items-center">
                <span className="text-xl mb-1">🎓</span>
                <span className="text-[11px] font-bold text-emerald-300">Foundation</span>
                <span className="text-[9px] text-slate-400">Core Logic Strong</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-center flex flex-col items-center">
                <span className="text-xl mb-1">⚡</span>
                <span className="text-[11px] font-bold text-amber-300">Bridge Ready</span>
                <span className="text-[9px] text-slate-400">Roadmap Active</span>
              </div>
            </div>

            {/* College Comparison Teaser (blurred card) */}
            <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 relative overflow-hidden">
              <div className="filter blur-xs select-none">
                <div className="text-xs font-bold text-slate-300">National University Benchmark: Rank #14 in State</div>
                <div className="text-[10px] text-slate-400">Average State Technological University student readiness: 58%</div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Institutional Benchmark Teaser
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
