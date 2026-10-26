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
      <div className={`max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2 border shadow-xs ${
            isDark ? 'bg-cyan-950/70 border-cyan-700/50 text-cyan-300' : 'bg-cyan-100 border-cyan-300 text-cyan-900 font-bold'
          }`}>
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
        <div className={`p-4 rounded-2xl border shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
          isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${
              isDark ? 'text-cyan-400' : 'text-blue-700'
            }`}>
              Select Curriculum Template (Locked to 2 Courses)
            </span>
            <h3 className={`font-extrabold text-sm sm:text-base mt-0.5 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Auditing: {currentCourse?.name || 'Academic Degree'}
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Board: {currentCourse?.typical_university || 'State University'} • Duration: {currentCourse?.duration || '4 Years'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {courses.map((course) => {
              const isSelected = course.id === selectedCourseId;
              return (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20 font-black'
                      : isDark
                        ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
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
              <div className={`rounded-2xl border p-6 shadow-xl flex flex-col justify-between transition-colors ${
                isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className={`flex items-center justify-between mb-4 pb-3 border-b ${
                    isDark ? 'border-slate-700/40' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isDark ? 'bg-blue-500/20 border border-blue-400/40 text-blue-400' : 'bg-blue-100 border border-blue-300 text-blue-700'
                      }`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>What Your Course Teaches</h3>
                        <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Semester subjects & units from standard syllabus
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-900 border-blue-300'
                    }`}>
                      {syllabus.length} Units
                    </span>
                  </div>

                  {/* List of syllabus units */}
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {syllabus.map((unit) => (
                      <div 
                        key={unit.id}
                        className={`p-3 rounded-xl border text-xs transition-colors ${
                          isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className={`truncate max-w-[200px] ${isDark ? 'text-cyan-300' : 'text-blue-800 font-extrabold'}`}>{unit.subject_name}</span>
                          <span className={`text-[10px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sem {unit.semester} • {unit.credit_hours} Credits</span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {unit.unit_topics}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t text-[11px] ${
                  isDark ? 'border-slate-700/40 text-slate-400' : 'border-slate-200 text-slate-600'
                }`}>
                  ℹ️ Baseline curricular units as taught by affiliated Indian state universities.
                </div>
              </div>

              {/* Column 2: What the market wants */}
              <div className={`rounded-2xl border p-6 shadow-xl flex flex-col justify-between transition-colors ${
                isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className={`flex items-center justify-between mb-4 pb-3 border-b ${
                    isDark ? 'border-slate-700/40' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isDark ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-400' : 'bg-emerald-100 border border-emerald-300 text-emerald-700'
                      }`}>
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>What The Market Wants</h3>
                        <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Real-time skills demanded by recruiters in {currentCourse?.stream}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}>
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
                        className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-1.5 transition-colors ${
                          isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className={`text-xs ${isDark ? 'text-white' : 'text-slate-900 font-extrabold'}`}>{m.skill}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                            isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}>
                            {m.demand_score}% Demand
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {m.reasoning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t text-[11px] ${
                  isDark ? 'border-slate-700/40 text-slate-400' : 'border-slate-200 text-slate-600'
                }`}>
                  ℹ️ Derived from regional tech park and commercial hiring databases.
                </div>
              </div>

            </div>

            {/* Gap Summary Panel: ✅ Covered & Relevant / ⚠️ Outdated / ❌ Missing Entirely */}
            <div className={`rounded-2xl border p-6 shadow-xl transition-colors ${
              isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
            }`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b ${
                isDark ? 'border-slate-700/40' : 'border-slate-200'
              }`}>
                <div>
                  <h3 className={`font-bold text-base flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    <Layers className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                    Gap Summary & Categorization Panel
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Triaged analysis of academic topics vs modern commercial standards
                  </p>
                </div>

                {/* Overall Gap Score badge */}
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Overall Gap Score:</span>
                  <div className={`px-3.5 py-1.5 rounded-xl border font-extrabold text-sm shadow-xs ${
                    isDark ? 'bg-red-950/60 border-red-500/50 text-red-300' : 'bg-red-100 border-red-300 text-red-900 font-black'
                  }`}>
                    {deepReport.gap_score}% Mismatch
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Covered & Relevant */}
                <div className={`rounded-xl border p-4 flex flex-col justify-between transition-colors ${
                  isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide ${
                        isDark ? 'text-emerald-400' : 'text-emerald-700'
                      }`}>
                        <CheckCircle2 className="w-4 h-4" />
                        Covered & Relevant
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        {deepReport.taught_and_relevant.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {deepReport.taught_and_relevant.map((r, idx) => (
                        <div key={idx} className={`p-2.5 rounded-lg border text-xs ${
                          isDark ? 'bg-emerald-950/20 border-emerald-900/40' : 'bg-emerald-50 border-emerald-200'
                        }`}>
                          <div className={`font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-900'}`}>{r.skill}</div>
                          <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Matched: {r.matched_topics.slice(0, 2).join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className={`text-[10px] pt-3 mt-3 border-t ${
                    isDark ? 'text-slate-400 border-slate-800' : 'text-slate-600 border-slate-200'
                  }`}>
                    Foundations aligned with modern standards.
                  </p>
                </div>

                {/* 2. Outdated */}
                <div className={`rounded-xl border p-4 flex flex-col justify-between transition-colors ${
                  isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide ${
                        isDark ? 'text-amber-400' : 'text-amber-700'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                        Taught But Outdated
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {deepReport.taught_but_outdated.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {deepReport.taught_but_outdated.map((o, idx) => (
                        <div key={idx} className={`p-2.5 rounded-lg border text-xs ${
                          isDark ? 'bg-amber-950/20 border-amber-900/40' : 'bg-amber-50 border-amber-200'
                        }`}>
                          <div className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>{o.topic}</div>
                          <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{o.reasoning}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className={`text-[10px] pt-3 mt-3 border-t ${
                    isDark ? 'text-slate-400 border-slate-800' : 'text-slate-600 border-slate-200'
                  }`}>
                    Legacy mechanics requiring immediate modernization.
                  </p>
                </div>

                {/* 3. Missing Entirely */}
                <div className={`rounded-xl border p-4 flex flex-col justify-between transition-colors ${
                  isDark ? 'bg-[#080E1E] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide ${
                        isDark ? 'text-red-400' : 'text-red-700'
                      }`}>
                        <XCircle className="w-4 h-4" />
                        Missing From Syllabus
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-900 border border-red-300'
                      }`}>
                        {deepReport.missing_from_syllabus.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {deepReport.missing_from_syllabus.slice(0, 4).map((m, idx) => (
                        <div key={idx} className={`p-2.5 rounded-lg border text-xs ${
                          isDark ? 'bg-red-950/20 border-red-900/40' : 'bg-red-50 border-red-200'
                        }`}>
                          <div className={`font-bold flex items-center justify-between ${isDark ? 'text-red-300' : 'text-red-900'}`}>
                            <span>{m.skill}</span>
                            <span className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{m.demand_score}% Demand</span>
                          </div>
                          <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{m.reasoning}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className={`text-[10px] pt-3 mt-3 border-t ${
                    isDark ? 'text-slate-400 border-slate-800' : 'text-slate-600 border-slate-200'
                  }`}>
                    Zero coverage in current semester coursework.
                  </p>
                </div>

              </div>

              {/* Actionable Recommendations Panel */}
              <div className={`mt-6 p-4 rounded-xl border text-xs ${
                isDark ? 'bg-blue-950/30 border-blue-800/40 text-blue-200' : 'bg-blue-50 border-blue-200 text-slate-800'
              }`}>
                <span className={`font-bold block mb-1 ${isDark ? 'text-cyan-400' : 'text-blue-800'}`}>Recommended Curricular Interventions:</span>
                <ul className={`list-disc pl-5 space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
