import { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  BookOpen, 
  TrendingUp, 
  Layers, 
  Briefcase,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { useTheme } from '../components/ThemeContext';

interface Course {
  id: number;
  name: string;
  stream: string;
  typical_university: string;
  duration: string;
}

interface SyllabusUnit {
  id: number;
  course_id: number;
  subject_name: string;
  unit_topics: string;
  semester: number;
  credit_hours: number;
}

interface DeepAnalysisReport {
  course: Course;
  taught_and_relevant: Array<{
    skill: string;
    matched_topics: string[];
    score: number;
  }>;
  taught_but_outdated: Array<{
    topic: string;
    subject: string;
    reasoning: string;
  }>;
  missing_from_syllabus: Array<{
    skill: string;
    demand_score: number;
    reasoning: string;
  }>;
  gap_score: number;
  recommendations: string[];
  generated_at: string;
}

export default function CurriculumAnalyzer() {
  const { isDark } = useTheme();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(1);
  const [syllabus, setSyllabus] = useState<SyllabusUnit[]>([]);
  const [deepReport, setDeepReport] = useState<DeepAnalysisReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pdfDownloading, setPdfDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch the 2 locked courses
  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data: Course[] = await res.json();
          // Filter strictly to the 2 specified Indian courses: B.Tech Computer Science and BBA (Marketing)
          const filtered = data.filter(c => 
            c.name.toLowerCase().includes('computer science') || 
            c.name.toLowerCase().includes('marketing') || 
            c.name.toLowerCase().includes('bba')
          ).slice(0, 2);

          setCourses(filtered.length > 0 ? filtered : data.slice(0, 2));
          if (filtered.length > 0) {
            setSelectedCourseId(filtered[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    }
    fetchCourses();
  }, []);

  // 2. Fetch syllabus and run deep analysis when selectedCourseId changes
  useEffect(() => {
    if (!selectedCourseId) return;

    async function analyzeCourse() {
      setLoading(true);
      setError(null);
      try {
        // Fetch syllabus
        const sRes = await fetch(`/api/courses/${selectedCourseId}/syllabus`);
        if (sRes.ok) {
          const sData = await sRes.json();
          setSyllabus(sData);
        }

        // Run deep analysis
        const aRes = await fetch(`/api/courses/${selectedCourseId}/analyze-deep`, {
          method: 'POST'
        });
        if (aRes.ok) {
          const aData = await aRes.json();
          setDeepReport(aData);
        }
      } catch (err: any) {
        console.error('Error analyzing course:', err);
        setError('Failed to compute curriculum gap comparison.');
      } finally {
        setLoading(false);
      }
    }

    analyzeCourse();
  }, [selectedCourseId]);

  // Handle PDF Download for Course Gap Report
  const handleDownloadPdf = async () => {
    if (!deepReport) return;
    setPdfDownloading(true);
    try {
      const res = await fetch(`/api/courses/${selectedCourseId}/download-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisData: deepReport })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Servixoo_Curriculum_Gap_${deepReport.course.name.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download Course Gap PDF');
      }
    } catch (err: any) {
      console.error('Download error:', err);
      alert(`Could not download PDF: ${err.message}`);
    } finally {
      setPdfDownloading(false);
    }
  };

  const currentCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  return (
    <div className={`w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 transition-colors ${
      isDark ? 'bg-[#080E1E] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`} id="curriculum-analyzer-page">
      
      {/* Header Block */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700/40 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2 border shadow-xs bg-cyan-950/60 border-cyan-700/50 text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Piece 4 of 5 • Two Indian Courses Only
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Curriculum Alignment Analyzer
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Side-by-side audit of academic university syllabi vs active recruiter demand. Detects outdated topics, missing technologies, and computes curriculum gap scores.
          </p>
        </div>

        {deepReport && (
          <button
            onClick={handleDownloadPdf}
            disabled={pdfDownloading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {pdfDownloading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Compiling PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download Syllabus Audit PDF</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Course Switcher (Strictly 2 Courses: B.Tech Computer Science & BBA Marketing) */}
        <div className={`p-4 rounded-2xl border shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
              Select Curriculum Template (Locked to 2 Courses)
            </span>
            <h3 className="font-extrabold text-sm text-white mt-0.5">
              Auditing: {currentCourse?.name || 'Academic Degree'}
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Board: {currentCourse?.typical_university || 'State University'} • Duration: {currentCourse?.duration || '4 Years'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {courses.map((course) => {
              const isSelected = course.id === selectedCourseId;
              return (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : isDark
                        ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  {course.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading state with skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            <div className={`h-80 rounded-2xl border ${isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-200 border-slate-300'}`} />
            <div className={`h-80 rounded-2xl border ${isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-200 border-slate-300'}`} />
          </div>
        )}

        {/* Main Content Area when loaded */}
        {!loading && deepReport && (
          <div className="space-y-6">
            
            {/* Two-Column Comparison: "What your course teaches" vs "What the market wants" */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Column 1: What your course teaches */}
              <div className={`rounded-2xl border p-6 shadow-xl flex flex-col justify-between ${
                isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">What Your Course Teaches</h3>
                        <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Semester subjects & units from standard syllabus
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {syllabus.length} Units
                    </span>
                  </div>

                  {/* List of syllabus units */}
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {syllabus.map((unit) => (
                      <div 
                        key={unit.id}
                        className={`p-3 rounded-xl border text-xs ${
                          isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-white mb-1">
                          <span className="truncate max-w-[200px] text-cyan-300">{unit.subject_name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">Sem {unit.semester} • {unit.credit_hours} Credits</span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {unit.unit_topics}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/40 text-[11px] text-slate-400">
                  ℹ️ Baseline curricular units as taught by affiliated Indian state universities.
                </div>
              </div>

              {/* Column 2: What the market wants */}
              <div className={`rounded-2xl border p-6 shadow-xl flex flex-col justify-between ${
                isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">What The Market Wants</h3>
                        <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Real-time skills demanded by recruiters in {currentCourse?.stream}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      2026 Demand
                    </span>
                  </div>

                  {/* Skills demanded in market */}
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {deepReport.missing_from_syllabus.concat(
                      deepReport.taught_and_relevant.map(r => ({
                        skill: r.skill,
                        demand_score: r.score,
                        reasoning: `Foundational concepts taught in: ${r.matched_topics.join(', ')}`
                      }))
                    ).map((m, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-1.5 ${
                          isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-white text-xs">{m.skill}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold">
                            {m.demand_score}% Demand
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {m.reasoning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/40 text-[11px] text-slate-400">
                  ℹ️ Derived from regional tech park and commercial hiring databases.
                </div>
              </div>

            </div>

            {/* Gap Summary Panel: ✅ Covered & Relevant / ⚠️ Outdated / ❌ Missing Entirely */}
            <div className={`rounded-2xl border p-6 shadow-xl ${
              isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-700/40 pb-4">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    Gap Summary & Categorization Panel
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Triaged analysis of academic topics vs modern commercial standards
                  </p>
                </div>

                {/* Overall Gap Score badge */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-300">Overall Gap Score:</span>
                  <div className="px-3.5 py-1.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 font-extrabold text-sm shadow-xs">
                    {deepReport.gap_score}% Mismatch
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Covered & Relevant */}
                <div className={`rounded-xl border p-4 flex flex-col justify-between ${
                  isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                        <CheckCircle2 className="w-4 h-4" />
                        Covered & Relevant
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                        {deepReport.taught_and_relevant.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {deepReport.taught_and_relevant.map((r, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs">
                          <div className="font-bold text-emerald-300">{r.skill}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Matched: {r.matched_topics.slice(0, 2).join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 pt-3 mt-3 border-t border-slate-800">
                    Foundations aligned with modern standards.
                  </p>
                </div>

                {/* 2. Outdated */}
                <div className={`rounded-xl border p-4 flex flex-col justify-between ${
                  isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wide">
                        <AlertTriangle className="w-4 h-4" />
                        Taught But Outdated
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                        {deepReport.taught_but_outdated.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {deepReport.taught_but_outdated.map((o, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs">
                          <div className="font-bold text-amber-300">{o.topic}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{o.reasoning}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 pt-3 mt-3 border-t border-slate-800">
                    Legacy mechanics requiring immediate modernization.
                  </p>
                </div>

                {/* 3. Missing Entirely */}
                <div className={`rounded-xl border p-4 flex flex-col justify-between ${
                  isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs uppercase tracking-wide">
                        <XCircle className="w-4 h-4" />
                        Missing From Syllabus
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                        {deepReport.missing_from_syllabus.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {deepReport.missing_from_syllabus.slice(0, 4).map((m, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/40 text-xs">
                          <div className="font-bold text-red-300 flex items-center justify-between">
                            <span>{m.skill}</span>
                            <span className="text-[9px] text-slate-400">{m.demand_score}% Demand</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{m.reasoning}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 pt-3 mt-3 border-t border-slate-800">
                    Zero coverage in current semester coursework.
                  </p>
                </div>

              </div>

              {/* Actionable Recommendations Panel */}
              <div className="mt-6 p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200">
                <span className="font-bold text-cyan-400 block mb-1">Recommended Curricular Interventions:</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  {deepReport.recommendations?.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
