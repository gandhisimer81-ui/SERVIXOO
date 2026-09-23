import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Curriculum, SkillGapReport } from '../types';
import { 
  FileSpreadsheet, 
  Play, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  Award, 
  Settings, 
  BrainCircuit, 
  AlertTriangle, 
  Download, 
  Sparkles, 
  TrendingUp, 
  BookOpen, 
  Cpu, 
  AlertOctagon, 
  Flame, 
  Clock, 
  Building 
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import FeedbackModal from '../components/FeedbackModal';

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
  // Tabs: 'deep_dive' or 'institutional'
  const [activeTab, setActiveTab] = useState<'deep_dive' | 'institutional'>('deep_dive');

  // --- States for Deep-Dive Tab ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | string>('');
  const [syllabus, setSyllabus] = useState<SyllabusUnit[]>([]);
  const [deepReport, setDeepReport] = useState<DeepAnalysisReport | null>(null);
  const [deepLoading, setDeepLoading] = useState(false);
  const [deepLoadingStep, setDeepLoadingStep] = useState(0);
  const [deepError, setDeepError] = useState<string | null>(null);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  // --- States for Institutional Tab ---
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<number | string>('');
  const [report, setReport] = useState<SkillGapReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // General Modal Trigger
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Loading sequences
  const loadingSteps = [
    'Ingesting course syllabus and parsing core topics...',
    'Running Scikit-learn TF-IDF vectorizers on regional skill matrices...',
    'Calculating Cosine Similarity of curriculum against in-demand profiles...',
    'Synthesizing gap scores & querying Gemini Curriculum Alignment specialist...'
  ];

  // Fetch Core Degrees & Registries
  useEffect(() => {
    async function initData() {
      try {
        // Fetch courses for Deep-Dive Tab
        const coursesRes = await fetch('/api/courses');
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData);
          if (coursesData.length > 0) {
            setSelectedCourseId(coursesData[0].id);
          }
        }

        // Fetch curricula for Institutional Tab
        const curriculaRes = await fetch('/api/curricula');
        if (curriculaRes.ok) {
          const curriculaData = await curriculaRes.json();
          setCurricula(curriculaData);
          if (curriculaData.length > 0) {
            setSelectedInstId(curriculaData[0].id);
          }
        }
      } catch (err) {
        console.error('Error initializing analyzer state:', err);
      }
    }
    initData();
  }, []);

  // Sync loading animations
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (deepLoading) {
      interval = setInterval(() => {
        setDeepLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [deepLoading]);

  // Fetch Syllabus when course changes
  useEffect(() => {
    if (!selectedCourseId) return;
    async function fetchSyllabus() {
      try {
        const res = await fetch(`/api/courses/${selectedCourseId}/syllabus`);
        if (res.ok) {
          const data = await res.json();
          setSyllabus(data);
        }
      } catch (err) {
        console.error('Error fetching course syllabus:', err);
      }
    }
    fetchSyllabus();
    setDeepReport(null);
    setDeepError(null);
  }, [selectedCourseId]);

  // Fetch Institutional report on selection
  useEffect(() => {
    if (!selectedInstId) return;
    async function fetchReport() {
      try {
        const res = await fetch(`/api/curricula/${selectedInstId}/report`);
        if (res.ok) {
          const data = await res.json();
          setReport(data);
        } else {
          setReport(null);
        }
      } catch (err) {
        console.error('Error fetching institutional report:', err);
      }
    }
    fetchReport();
    setError(null);
  }, [selectedInstId]);

  // Trigger Deep-Dive analysis
  async function handleDeepAnalyze() {
    if (!selectedCourseId) return;
    setDeepLoading(true);
    setDeepLoadingStep(0);
    setDeepError(null);
    setDeepReport(null);

    try {
      const res = await fetch(`/api/courses/${selectedCourseId}/analyze-deep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setDeepReport(data);
      } else {
        const errData = await res.json();
        setDeepError(errData.error || 'Deep analysis compilation failed.');
      }
    } catch (err) {
      setDeepError('Connection failed. Please ensure both Express and Python servers are running.');
    } finally {
      setDeepLoading(false);
    }
  }

  // Trigger Institutional analysis
  async function handleInstAnalyze() {
    if (!selectedInstId) return;
    setLoading(true);
    setLoadingStep(0);
    setError(null);
    setReport(null);

    try {
      const res = await fetch(`/api/curricula/${selectedInstId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Institutional analysis failed.');
      }
    } catch (err) {
      setError('Connection refused. Please check microservice status.');
    } finally {
      setLoading(false);
    }
  }

  // Download PDF Gap Report
  async function downloadCoursePdf() {
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
        a.download = `Servixoo_Detailed_Gap_Report_${deepReport.course.name.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Could not compile PDF. Please verify Python ReportLab is responding.');
      }
    } catch (err) {
      console.error('Error generating course PDF:', err);
    } finally {
      setPdfDownloading(false);
    }
  }

  // Prep chart dataset
  const buildChartData = () => {
    if (!deepReport) return [];
    const aligned = deepReport.taught_and_relevant.map(item => ({
      name: item.skill,
      'Syllabus Match': 100,
      'Market Demand': item.score
    }));
    const missed = deepReport.missing_from_syllabus.map(item => ({
      name: item.skill,
      'Syllabus Match': 10,
      'Market Demand': item.demand_score
    }));
    return [...aligned, ...missed].slice(0, 8);
  };

  const chartData = buildChartData();
  const activeCourse = courses.find(c => c.id === Number(selectedCourseId));
  const activeInst = curricula.find(c => c.id === Number(selectedInstId));

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]" id="curriculum-analyzer-page">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-600" />
            <span>Curriculum Core-Alignment Analyzer</span>
          </h2>
          <p className="text-slate-500 text-sm">Contrast Indian university syllabi against high-demand labor market criteria with regional NLP logs and Gemini.</p>
        </div>

        {/* Tab Controls (No-Border Tab Switcher) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('deep_dive')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-colors cursor-pointer ${
              activeTab === 'deep_dive'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Course Deep-Dive
          </button>
          <button
            onClick={() => setActiveTab('institutional')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-colors cursor-pointer ${
              activeTab === 'institutional'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Institutional Registries
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: COURSE DEEP-DIVE ==================== */}
      {activeTab === 'deep_dive' && (
        <div className="flex flex-col gap-8">
          
          {/* Selector & Overview Block */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Indian Degree Program</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  disabled={deepLoading}
                  className="w-full max-w-lg px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                >
                  <option value="">-- Choose Degree Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.stream})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleDeepAnalyze}
                disabled={deepLoading || !selectedCourseId}
                className={`px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition duration-150 cursor-pointer ${
                  deepLoading || !selectedCourseId
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 hover:scale-[1.01]'
                }`}
              >
                <Play className="w-4 h-4 fill-white text-white animate-pulse" />
                <span>Deep Syllabus Comparison</span>
              </button>
            </div>

            {/* Selected Course Metadata */}
            {activeCourse && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span>Affiliated: <strong className="text-slate-800">{activeCourse.typical_university}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Duration: <strong className="text-slate-800">{activeCourse.duration}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>Stream Category: <strong className="text-slate-800">{activeCourse.stream}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Main Workspace Area */}
          {deepLoading ? (
            <div className="bg-white rounded-2xl p-16 border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <BrainCircuit className="w-6 h-6 text-blue-600 absolute inset-0 m-auto" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-6 tracking-tight">Compiling Labour Market Gaps</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-md text-center h-12 flex items-center justify-center leading-relaxed font-medium">
                {loadingSteps[deepLoadingStep]}
              </p>
            </div>
          ) : deepError ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex gap-4 items-start">
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-rose-900">Analysis Pipeline Failed</h4>
                <p className="text-sm text-rose-700 leading-relaxed">{deepError}</p>
                <span className="text-xs text-rose-500 mt-1">Verify that python is running and SQLite is seeded correctly.</span>
              </div>
            </div>
          ) : deepReport ? (
            <div className="flex flex-col gap-8">
              
              {/* Executive Indicators (Bento Grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Alignment Radial Gauge */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-between text-center min-h-[260px]">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Alignment Index</span>
                  
                  <div className="relative w-36 h-36 flex items-center justify-center mt-2">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="62" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                      <circle
                        cx="72"
                        cy="72"
                        r="62"
                        stroke={100 - deepReport.gap_score >= 70 ? '#059669' : 100 - deepReport.gap_score >= 50 ? '#d97706' : '#dc2626'}
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={390}
                        strokeDashoffset={390 - (390 * (100 - deepReport.gap_score)) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-extrabold text-slate-800">{Math.round(100 - deepReport.gap_score)}%</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Aligned</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-4 text-[11px] font-bold text-slate-500">
                    <span>Deficit Gap:</span>
                    <span className="text-rose-600">{deepReport.gap_score}%</span>
                  </div>
                </div>

                {/* Competency Gap Comparison Radar/Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col min-h-[260px]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Competency Coverage Mapping</span>
                      <span className="text-[10px] text-slate-400">Comparing Syllabus inclusion with actual employer demand scores</span>
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-md">Scikit Tfidf Vectorizer</span>
                  </div>

                  <div className="flex-1 h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 9 }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Bar dataKey="Market Demand" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="Syllabus Match" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Multi-Column Syllabus comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Academic Syllabus Structure Column */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span>University Syllabus subjects</span>
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Seeded Structure</span>
                  </div>

                  <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-1">
                    {syllabus.map((unit) => (
                      <div key={unit.id} className="p-4 rounded-xl bg-[#f8fafc] border border-slate-200/60 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-900 bg-blue-50/80 border border-blue-100 px-2.5 py-1 rounded-md">
                            Sem {unit.semester} — {unit.credit_hours} Credits
                          </span>
                          <span className="text-xs font-semibold text-slate-800">{unit.subject_name}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {unit.unit_topics.split(',').map((topic, idx) => {
                            const isOutdated = deepReport.taught_but_outdated.some(o => o.topic.toLowerCase().trim() === topic.toLowerCase().trim());
                            return (
                              <span 
                                key={idx} 
                                className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                                  isOutdated 
                                    ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                    : 'bg-white text-slate-600 border-slate-200'
                                }`}
                              >
                                {topic.trim()}
                                {isOutdated && ' ⚠️'}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Industry demand skill mapping Column */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                      <span>Current job market expectations</span>
                    </h3>
                    <span className="text-[10px] font-bold text-green-600 uppercase">Active demand</span>
                  </div>

                  <div className="flex flex-col gap-3.5 max-h-[400px] overflow-y-auto pr-1">
                    {deepReport.taught_and_relevant.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30 flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-800">{item.skill}</span>
                          <span className="text-[10px] text-emerald-700 font-semibold">Taught & fully relevant</span>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                          {item.score}% Demand
                        </span>
                      </div>
                    ))}

                    {deepReport.missing_from_syllabus.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/20 flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-800">{item.skill}</span>
                          <span className="text-[10px] text-rose-700 font-semibold">Completely missing from course</span>
                        </div>
                        <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                          {item.demand_score}% Demand
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Panels (Taught & Relevant, Taught but Outdated, Gaps) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Card 1: Core Strengths */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Syllabus Strengths</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Skills successfully covered by current subjects</p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {deepReport.taught_and_relevant.length > 0 ? (
                      deepReport.taught_and_relevant.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/50 flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-800">{item.skill}</span>
                          <span className="text-[9px] text-slate-500 font-semibold">Matched: {item.matched_topics.slice(0, 2).join(', ')}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-medium italic text-center p-4">No matching strengths found.</span>
                    )}
                  </div>
                </div>

                {/* Card 2: Candidates for Modernization */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4 animate-bounce" />
                      <span>Legacy / Outdated Topics</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Syllabus modules obsolete in mainstream industry</p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {deepReport.taught_but_outdated.length > 0 ? (
                      deepReport.taught_but_outdated.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-amber-50/40 border border-amber-100/50 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">{item.topic}</span>
                            <span className="text-[8px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">Legacy</span>
                          </div>
                          <span className="text-[9px] text-slate-500 font-semibold">Subject: {item.subject}</span>
                          <p className="text-[9px] text-slate-600 mt-1 leading-relaxed border-t border-amber-200/30 pt-1">{item.reasoning}</p>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-medium italic text-center p-4">Syllabus has no major legacy items!</span>
                    )}
                  </div>
                </div>

                {/* Card 3: Labor Market Gaps */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                      <span>Labor Gaps (Unrepresented)</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Required skills completely missing from subjects</p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {deepReport.missing_from_syllabus.length > 0 ? (
                      deepReport.missing_from_syllabus.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-rose-50/30 border border-rose-100/50 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">{item.skill}</span>
                            <span className="text-[9px] text-rose-600 font-extrabold">{item.demand_score}/100</span>
                          </div>
                          <p className="text-[9px] text-slate-600 leading-relaxed mt-0.5">{item.reasoning}</p>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-medium italic text-center p-4">Perfect score! No labor gaps.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action plan & Recommendations */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch gap-8">
                
                {/* Advisor Recommendation List */}
                <div className="flex-1 flex flex-col gap-5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Strategic Curriculum alignment plan</h4>
                      <p className="text-[10px] text-slate-400">Actionable modernization steps compiled by Gemini</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {deepReport.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3.5 items-start">
                        <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PDF Generation and Report Inaccuracy Buttons */}
                <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-center gap-4">
                  <div className="text-xs text-slate-500 font-semibold leading-relaxed mb-1">
                    Export this syllabus deep-dive comparison as a highly styled offline PDF, complete with Gemini market context and Scikit competency matrix forecasts.
                  </div>

                  <button
                    onClick={downloadCoursePdf}
                    disabled={pdfDownloading}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 shadow-lg transition duration-150 cursor-pointer ${
                      pdfDownloading
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-slate-900 hover:bg-black text-white shadow-slate-900/10'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>{pdfDownloading ? 'Compiling PDF...' : 'Download PDF Report'}</span>
                  </button>

                  <button
                    onClick={() => setIsFeedbackOpen(true)}
                    className="w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Report Inaccuracy</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl p-16 border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="p-4 rounded-full bg-blue-50 text-blue-600">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-4 tracking-tight">Awaiting Syllabus Analysis</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-sm leading-relaxed font-medium">
                Select an Indian degree course and click &quot;Deep Syllabus Comparison&quot; to generate an executive co-alignment matrix mapping.
              </p>
            </div>
          )}

        </div>
      )}

      {/* ==================== TAB 2: INSTITUTIONAL REGISTRIES ==================== */}
      {activeTab === 'institutional' && (
        <div className="flex flex-col gap-8">
          
          {/* Selector & Action */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Registered College</label>
                <select
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  disabled={loading}
                  className="w-full max-w-lg px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                >
                  <option value="">-- Choose Registered Institution --</option>
                  {curricula.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.institution_name} — {c.course_name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleInstAnalyze}
                disabled={loading || !selectedInstId}
                className={`px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition duration-150 cursor-pointer ${
                  loading || !selectedInstId
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 hover:scale-[1.01]'
                }`}
              >
                <Play className="w-4 h-4 fill-white text-white" />
                <span>Analyze Registry</span>
              </button>
            </div>

            {/* Current topics list display */}
            {activeInst && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Registered Syllabus Topics</span>
                  <span className="text-[9px] text-slate-400 font-medium">Last Synced: {activeInst.last_updated}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeInst.topics.split(',').map((topic, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600"
                    >
                      {topic.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Area */}
          {loading ? (
            <div className="bg-white rounded-2xl p-16 border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <BrainCircuit className="w-6 h-6 text-blue-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-6 tracking-tight">Processing Alignment Pipeline</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md text-center h-12 flex items-center justify-center leading-relaxed font-semibold">
                {loadingSteps[loadingStep]}
              </p>
            </div>
          ) : error ? (
            <div className="bg-rose-50/50 rounded-2xl p-8 border border-rose-100 flex items-start gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-bold text-rose-900">Analysis Service Error</h3>
                <p className="text-sm text-rose-700 leading-relaxed max-w-xl">{error}</p>
                <p className="text-xs text-rose-500 mt-1">
                  Please verify that your Python microservice is active on port 5000.
                </p>
              </div>
            </div>
          ) : report ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="analyzer-results-grid">
              
              {/* Visual Scores & Gaps Panel (1/3 Width) */}
              <div className="flex flex-col gap-6">
                
                {/* Radial score */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Alignment Index</span>
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke={report.gap_score && report.gap_score > 60 ? '#ef4444' : '#f59e0b'}
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * (report.gap_score || 50)) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-extrabold text-slate-800">{report.gap_score}%</span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Skill Gap</span>
                    </div>
                  </div>
                  
                  <div className={`mt-6 px-4 py-2 rounded-xl text-xs font-bold border ${
                    report.gap_score && report.gap_score > 60
                      ? 'bg-rose-50 text-rose-600 border-rose-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {report.gap_score && report.gap_score > 60 ? 'CRITICAL STRUCTURAL GAP' : 'MODERATE STRUCTURAL GAP'}
                  </div>
                </div>

                {/* Missing list */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">Detected Missing Skills</h3>
                    <p className="text-xs text-slate-400 mt-0.5">High demand skills not found in curriculum</p>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {report.missing_skills.split(',').slice(0, 10).map((skill, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-xs font-semibold text-slate-700">{skill.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Advisor Report Panel (2/3 Width) */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">Gemini Alignment Report</h3>
                      <p className="text-[10px] text-slate-400">Generated: {report.created_at}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFeedbackOpen(true)}
                      className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer"
                      title="Report Inaccuracy"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Report Inaccuracy</span>
                    </button>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-100">
                      LMI Agent: v1.0
                    </span>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed prose-headings:text-slate-800 prose-headings:font-bold prose-headings:tracking-tight prose-h3:text-sm prose-h3:uppercase prose-h3:tracking-wider prose-h3:text-slate-400 prose-h3:mt-6 prose-h3:mb-2.5">
                  <ReactMarkdown>{report.recommendation_text}</ReactMarkdown>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl p-16 border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="p-4 rounded-full bg-blue-50 text-blue-600">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-4 tracking-tight">Awaiting Analysis</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-sm leading-relaxed font-semibold">
                Click &quot;Analyze Registry&quot; to invoke Scikit-learn similarity matching and generate tailored updates.
              </p>
            </div>
          )}

        </div>
      )}

      {/* Feedback Modal Support */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        reportId={report ? report.id : null}
        curriculumId={selectedInstId ? Number(selectedInstId) : null}
      />
    </div>
  );
}
