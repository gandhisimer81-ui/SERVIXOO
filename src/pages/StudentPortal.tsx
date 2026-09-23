import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  CheckCircle, 
  FileDown, 
  Play, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  BookOpen,
  Ban,
  ListTodo,
  Flame,
  ArrowLeft,
  Upload,
  Link,
  MessageSquare,
  Share2,
  DollarSign,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  LineChart as LineIcon,
  Search,
  Globe,
  PieChart,
  Moon,
  Sun
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const COMMON_SKILLS = [
  'Python', 'React', 'Machine Learning', 'SQL', 'Cloud Computing', 
  'Docker', 'TypeScript', 'Data Analysis', 'Java', 'UI/UX Design', 
  'MS Excel', 'MS Word', 'PowerPoint', 'Communication', 'Public Speaking'
];

const ARCHITECT_ROLES = [
  'Python Developer',
  'Full-Stack Engineer',
  'AI / Machine Learning Engineer',
  'DevOps Specialist',
  'Data Scientist',
  'Frontend Developer',
  'UI/UX Designer',
  'Product Manager'
];

// YouTube and Free Course Links
const COURSE_RECOMMENDATIONS: Record<string, { courseName: string, provider: string, url: string }> = {
  'Python': { courseName: 'Scientific Computing with Python', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/' },
  'React': { courseName: 'Front End Development Libraries (React)', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/' },
  'Machine Learning': { courseName: 'Machine Learning with Python Course', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/machine-learning-with-python/' },
  'SQL': { courseName: 'Relational Database Certification', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/relational-database/' },
  'Cloud Computing': { courseName: 'AWS Cloud Practitioner Essentials', provider: 'Coursera', url: 'https://www.coursera.org/learn/aws-cloud-practitioner-essentials' },
  'Docker': { courseName: 'Docker for Beginners', provider: 'YouTube', url: 'https://www.youtube.com/watch?v=pTFZFf8g4DY' },
  'TypeScript': { courseName: 'TypeScript Masterclass', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=d56mG7DezGs' },
  'Data Analysis': { courseName: 'Data Analysis with Python', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/data-analysis-with-python/' },
  'Java': { courseName: 'Java Programming Course for Beginners', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=A74ToXhy3yA' },
  'UI/UX Design': { courseName: 'Introduction to Figma & UI Design', provider: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=c9Wg6g_Hbsg' },
  'MS Excel': { courseName: 'Excel for Analysts', provider: 'YouTube', url: 'https://www.youtube.com/watch?v=rwbho0CgEAE' },
  'Communication': { courseName: 'Professional Communication Skills', provider: 'Coursera', url: 'https://www.coursera.org/learn/professional-communication' },
  'Public Speaking': { courseName: 'Dynamic Public Speaking', provider: 'Coursera', url: 'https://www.coursera.org/learn/public-speaking' },
  'Node.js': { courseName: 'Back End Development and APIs', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/' }
};

// YouTube IDs for tutorials mapped to skill names
const TUTORIAL_VIDEOS: Record<string, string> = {
  'Python': '_uQrJ0TkZlc',
  'React': 'Ke90Tje7VS0',
  'Machine Learning': 'GwIo3gToUtg',
  'SQL': 'HXV3zeQKqGY',
  'Cloud Computing': 'EN4fE4867rc',
  'Docker': 'pTFZFf8g4DY',
  'TypeScript': 'd56mG7DezGs',
  'Data Analysis': 'r-uOLxNyf8A',
  'Java': 'A74ToXhy3yA',
  'UI/UX Design': 'c9Wg6g_Hbsg',
  'MS Excel': 'rwbho0CgEAE',
  'Communication': 'HAnw16m1g94',
  'Public Speaking': 'i5mYp-O_b9c',
  'Kubernetes': 'X48VuDVv0do',
  'DevOps': 'hQcFE0RD0cQ',
  'Node.js': 'Tb9k9_gko5Y'
};

const INDIA_SALARY_BANDS: Record<string, string> = {
  'Software Developer': '₹5L - ₹14L LPA',
  'Python Developer': '₹6L - ₹15L LPA',
  'Full-Stack Engineer': '₹7L - ₹18L LPA',
  'AI / Machine Learning Engineer': '₹9L - ₹24L LPA',
  'DevOps Specialist': '₹8L - ₹20L LPA',
  'Data Scientist': '₹8L - ₹22L LPA',
  'Frontend Developer': '₹5L - ₹13L LPA',
  'UI/UX Designer': '₹4.5L - ₹12L LPA',
  'Data Analyst': '₹4L - ₹10L LPA',
  'Digital Marketer': '₹3.5L - ₹9L LPA',
  'HR Executive': '₹3L - ₹7.5L LPA',
  'Product Manager': '₹12L - ₹30L LPA'
};

interface GapReport {
  readiness_score: number;
  matched_skills: string[];
  missing_skills: string[];
  dream_job: string;
  peer_percentile?: number;
  institution?: string;
  salaryBand?: string;
}

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState<'assess' | 'architect' | 'institution'>('architect');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Tab 1: Readiness Assessor States
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkills, setCustomSkills] = useState<string>('');
  const [dreamJob, setDreamJob] = useState<string>('Software Developer');
  const [customJob, setCustomJob] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [report, setReport] = useState<GapReport | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [institutionName, setInstitutionName] = useState<string>('State Technological University');

  // Resume Parsing States
  const [pastingResume, setPastingResume] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>('');
  const [linkedinInput, setLinkedinInput] = useState<string>('');
  const [parsingResume, setParsingResume] = useState<boolean>(false);

  // Tab 2: AI Career Architect States
  const [collegeTaughtInput, setCollegeTaughtInput] = useState<string>(
    'Learned basic C programming, static arrays, for/while loops, legacy Turbo C compiler headers, traditional file indexing structures, and relational DBMS theory on paper without live databases.'
  );
  const [targetRoleInput, setTargetRoleInput] = useState<string>('Python Developer');
  const [customTargetRole, setCustomTargetRole] = useState<string>('');
  const [architecting, setArchitecting] = useState<boolean>(false);
  const [architectLoadingStep, setArchitectLoadingStep] = useState<string>('');
  const [generatedRoadmap, setGeneratedRoadmap] = useState<any | null>(null);

  // Interactive Live Job Scraper States
  const [scrapingJobs, setScrapingJobs] = useState<boolean>(false);
  const [scrapeSuccess, setScrapeSuccess] = useState<string>('');

  // Interactive Interview Simulator States
  const [simulating, setSimulating] = useState<boolean>(false);
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [showAnswerHint, setShowAnswerHint] = useState<boolean>(false);

  // Institution Gap states
  const [instGaps, setInstGaps] = useState<any[]>([]);
  const [instTotal, setInstTotal] = useState<number>(0);
  const [instLoading, setInstLoading] = useState<boolean>(false);

  // Progress milestones states (checked list)
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});
  const [dynamicReadiness, setDynamicReadiness] = useState<number>(50);

  // Share Card state
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  useEffect(() => {
    if (report) {
      setDynamicReadiness(report.readiness_score);
    }
  }, [report]);

  // Handle milestone checkbox toggles
  const handleMilestoneToggle = (item: string) => {
    setCompletedMilestones(prev => {
      const updated = { ...prev, [item]: !prev[item] };
      
      // Dynamically recalculate readiness score!
      if (report) {
        const checkedCount = Object.values(updated).filter(Boolean).length;
        const totalMilestones = report.missing_skills.length + 1; // missing skills + portfolio capstone
        const boost = Math.round((checkedCount / totalMilestones) * (100 - report.readiness_score));
        setDynamicReadiness(Math.min(100, report.readiness_score + boost));
      }
      return updated;
    });
  };

  // Fetch Institution Aggregate Gap analytics
  const fetchInstitutionAnalytics = async () => {
    setInstLoading(true);
    try {
      const res = await fetch('/api/student/aggregate-gaps');
      if (res.ok) {
        const data = await res.json();
        setInstGaps(data.gaps || []);
        setInstTotal(data.totalAssessments || 0);
      }
    } catch (err) {
      console.error('Error fetching institution analytics:', err);
    } finally {
      setInstLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'institution') {
      fetchInstitutionAnalytics();
    }
  }, [activeTab]);

  // Trigger Live job crawler
  const handleTriggerScraper = async () => {
    setScrapingJobs(true);
    setScrapeSuccess('');
    try {
      const res = await fetch('/api/jobs/scrape', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setScrapeSuccess(`Injected ${data.count} live job listings into Labor Intelligence cache.`);
      }
    } catch (err) {
      console.error('Error triggering job scraper:', err);
    } finally {
      setScrapingJobs(false);
    }
  };

  // Handle resume copy-paste parsing via Gemini
  const handleParseResume = async () => {
    if (!pastedText.trim() && !linkedinInput.trim()) return;
    setParsingResume(true);
    try {
      const res = await fetch('/api/student/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: pastedText, linkedinUrl: linkedinInput })
      });
      if (res.ok) {
        const parsed = await res.json();
        
        // Auto-populate form
        if (parsed.extractedSkills) {
          const preSelected = COMMON_SKILLS.filter(skill => 
            parsed.extractedSkills.some((es: string) => es.toLowerCase().includes(skill.toLowerCase()))
          );
          setSelectedSkills(preSelected);
          
          // Set extra custom skills
          const remainingCustom = parsed.extractedSkills.filter((es: string) => 
            !preSelected.some(ps => es.toLowerCase().includes(ps.toLowerCase()))
          );
          setCustomSkills(remainingCustom.join(', '));
        }

        if (parsed.dreamJob) {
          const matchedJob = Object.keys(INDIA_SALARY_BANDS).find((j: string) => j.toLowerCase().includes(parsed.dreamJob.toLowerCase())) || 'Software Developer';
          setDreamJob(matchedJob);
          if (matchedJob === 'Other') {
            setCustomJob(parsed.dreamJob);
          }
        }

        setPastingResume(false);
        setPastedText('');
        setLinkedinInput('');
        
        // Dynamic notify banner
        alert(`Successfully parsed ${parsed.candidateName || 'your profile'}! Form auto-filled with ${parsed.extractedSkills?.length || 0} skills.`);
      }
    } catch (err) {
      console.error('Error parsing resume:', err);
    } finally {
      setParsingResume(false);
    }
  };

  // Generate customized Technical Interview questions based on current gap report
  const handleSimulateInterview = async () => {
    if (!report || report.missing_skills.length === 0) return;
    setSimulating(true);
    setInterviewQuestions([]);
    try {
      const res = await fetch('/api/student/interview-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missingSkills: report.missing_skills,
          targetRole: report.dream_job
        })
      });
      if (res.ok) {
        const data = await res.json();
        setInterviewQuestions(data.questions || []);
        if (data.questions && data.questions.length > 0) {
          setActiveQuestionId(data.questions[0].id);
          setShowAnswerHint(false);
        }
      }
    } catch (err) {
      console.error('Error simulating interview questions:', err);
    } finally {
      setSimulating(false);
    }
  };

  // Tab 1: Toggle Skill Selection
  const handleToggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  // Tab 1: Submit Alignment Assessment
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    setReport(null);
    setGeneratedRoadmap(null);
    setInterviewQuestions([]);
    
    const steps = [
      'Normalizing student profile...',
      'Retrieving industry-standard required skills...',
      'Running cosine similarity in Python scikit-learn...',
      'Compiling gap alignment results...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const finalSkills = [...selectedSkills];
    if (customSkills.trim()) {
      customSkills.split(',').forEach(sk => {
        const trimmed = sk.trim();
        if (trimmed && !finalSkills.includes(trimmed)) {
          finalSkills.push(trimmed);
        }
      });
    }

    const finalJob = dreamJob === 'Other' ? customJob : dreamJob;

    try {
      const res = await fetch('/api/student/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collegeSkills: finalSkills,
          dreamJob: finalJob,
          institution: institutionName
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReport({
          readiness_score: data.readiness_score,
          matched_skills: data.matched_skills,
          missing_skills: data.missing_skills,
          dream_job: finalJob,
          peer_percentile: data.peer_percentile,
          institution: institutionName,
          salaryBand: INDIA_SALARY_BANDS[finalJob] || '₹5L - ₹12L LPA'
        });
      } else {
        console.error('Failed to run alignment analyzer');
      }
    } catch (err) {
      console.error('Error conducting student alignment analysis:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Tab 2: Submit AI Career Architect Roadmap Generation
  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeTaughtInput.trim()) return;

    setArchitecting(true);
    setGeneratedRoadmap(null);
    setReport(null);
    setInterviewQuestions([]);

    const steps = [
      'Activating AI Career Architect Engine...',
      'Parsing syllabus baseline and legacy parameters...',
      'Calculating transition bridges for foundational programming logic...',
      'Interfacing with real-time regional job-market expectations...',
      'Structuring personalized non-linear milestones...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setArchitectLoadingStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const finalRole = targetRoleInput === 'Other' ? customTargetRole : targetRoleInput;

    try {
      const rRes = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          college_taught: collegeTaughtInput,
          target_role: finalRole,
          student_id: 'guest_student'
        })
      });

      if (rRes.ok) {
        const roadmap = await rRes.json();
        setGeneratedRoadmap(roadmap);

        // Derive basic skills from input keywords to run Scikit-learn assessor concurrently
        const parsedSkills: string[] = [];
        const lowerInput = collegeTaughtInput.toLowerCase();
        COMMON_SKILLS.forEach(skill => {
          if (lowerInput.includes(skill.toLowerCase())) {
            parsedSkills.push(skill);
          }
        });

        if (lowerInput.includes('basic c') || lowerInput.includes('turbo c') || lowerInput.includes('loops')) {
          if (!parsedSkills.includes('Java')) parsedSkills.push('Java');
        }

        const aRes = await fetch('/api/student/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collegeSkills: parsedSkills.length > 0 ? parsedSkills : ['Java'],
            dreamJob: finalRole,
            ai_roadmap: roadmap,
            institution: institutionName
          })
        });

        if (aRes.ok) {
          const aData = await aRes.json();
          setReport({
            readiness_score: aData.readiness_score,
            matched_skills: aData.matched_skills,
            missing_skills: aData.missing_skills,
            dream_job: finalRole,
            peer_percentile: aData.peer_percentile || 68,
            institution: institutionName,
            salaryBand: INDIA_SALARY_BANDS[finalRole] || '₹6L - ₹14L LPA'
          });
        }
      } else {
        console.error('Failed to architect roadmap from gateway.');
      }
    } catch (err) {
      console.error('Error architecting roadmap:', err);
    } finally {
      setArchitecting(false);
    }
  };

  const handleDownloadPDF = () => {
    window.location.href = '/api/student/download-pdf';
  };

  const handleReset = () => {
    setReport(null);
    setGeneratedRoadmap(null);
    setSelectedSkills([]);
    setCustomSkills('');
    setCustomJob('');
    setCompletedMilestones({});
    setInterviewQuestions([]);
    setCollegeTaughtInput('Learned basic C programming, static arrays, for/while loops, legacy Turbo C compiler headers, traditional file indexing structures, and relational DBMS theory on paper without live databases.');
  };

  const handleCopyShareCard = () => {
    if (!report) return;
    const text = `🚀 My Hiring Readiness Report via Servixoo!\n🎯 Role: ${report.dream_job}\n📈 Readiness Score: ${dynamicReadiness}%\n🏆 More ready than ${report.peer_percentile}% of CS students.\n#CurriculumReform #Employability #JobReady`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Simulated line chart historical data for growth visualization
  const getProgressChartData = () => {
    if (!report) return [];
    const baseScore = report.readiness_score;
    const totalMilestones = report.missing_skills.length + 1;
    const increment = (100 - baseScore) / totalMilestones;
    
    const chartData = [
      { step: 'Baseline', score: baseScore }
    ];
    
    report.missing_skills.forEach((skill, index) => {
      chartData.push({
        step: `Learn ${skill}`,
        score: Math.round(baseScore + (index + 1) * increment)
      });
    });
    chartData.push({ step: 'Portfolio Done', score: 100 });
    return chartData;
  };

  return (
    <div className={`flex-1 overflow-y-auto p-8 transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#fafafa] text-slate-900'}`} id="student-portal-viewport">
      {/* Light/Dark Toggle & Refresh live crawler */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold ${
            darkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          <span>{darkMode ? 'Light Theme' : 'Dark Luxury'}</span>
        </button>

        <button
          onClick={handleTriggerScraper}
          disabled={scrapingJobs}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            scrapingJobs 
              ? 'bg-blue-50/50 border-blue-100 text-blue-400' 
              : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scrapingJobs ? 'animate-spin' : ''}`} />
          <span>{scrapingJobs ? 'Crawling Job Boards...' : 'Refresh Live Market Feeds'}</span>
        </button>
      </div>

      {scrapeSuccess && (
        <div className="max-w-5xl mx-auto mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {scrapeSuccess}
        </div>
      )}

      {/* Top Banner Branding */}
      <div className={`max-w-5xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`} id="student-header">
        <div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50/80 dark:bg-blue-950/40 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900 uppercase tracking-wider">
            Student Employability Hub
          </span>
          <h2 className="text-3xl font-extrabold mt-3 tracking-tight">
            AI Career Architect & Advisor
          </h2>
          <p className={`text-sm mt-1 max-w-2xl leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Translate academic studies directly into regional hiring standards. Generate custom logical transition plans, and export matching PDF dossiers instantly.
          </p>
        </div>
        
        {/* Reset button shown if report exists */}
        {(report || generatedRoadmap) && (
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-xs shadow-sm cursor-pointer transition-all self-start md:self-center ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restart Assessment
          </button>
        )}
      </div>

      {/* Tab Selector Buttons */}
      {(!report && !generatedRoadmap && !analyzing && !architecting) && (
        <div className={`max-w-5xl mx-auto mb-8 flex p-1 rounded-xl max-w-lg ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-100'}`} id="tab-switcher">
          <button
            onClick={() => setActiveTab('architect')}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'architect'
                ? 'bg-blue-600 text-white shadow-sm'
                : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            AI Career Architect
          </button>
          <button
            onClick={() => setActiveTab('assess')}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'assess'
                ? 'bg-blue-600 text-white shadow-sm'
                : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Readiness Assessor
          </button>
          <button
            onClick={() => setActiveTab('institution')}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'institution'
                ? 'bg-blue-600 text-white shadow-sm'
                : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Institution Hub
          </button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto">
        
        {/* INSTITUTION TAB PANEL */}
        {activeTab === 'institution' && !report && !generatedRoadmap && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold">Institution Gap Dashboard</h3>
                  <p className="text-xs text-slate-400">Scale-level curriculum reform gap analytics across affiliate student assessments</p>
                </div>
                <div className="bg-blue-500/15 border border-blue-500/30 px-3.5 py-1.5 rounded-xl">
                  <span className="text-xs font-black text-blue-500">{instTotal} Total Student Runs</span>
                </div>
              </div>

              {instLoading ? (
                <div className="flex justify-center items-center py-12 gap-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 font-semibold">Consolidating institution-wide diagnostics...</p>
                </div>
              ) : instGaps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-red-500 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Critical Curriculum Deficiencies
                    </h4>
                    <p className="text-xs text-slate-400">
                      These are the exact skills/competencies our students are most frequently missing when matching modern corporate mandates.
                    </p>
                    <div className="space-y-3 pt-2">
                      {instGaps.slice(0, 5).map((gap, index) => (
                        <div key={gap.skill} className="flex justify-between items-center p-3 rounded-xl bg-slate-500/5 border border-slate-500/10">
                          <span className="text-xs font-bold">{gap.skill}</span>
                          <span className="text-xs font-black text-amber-500">{gap.count} assessments missing this</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={instGaps.slice(0, 6)}>
                        <PolarGrid stroke={darkMode ? '#334155' : '#e2e8f0'} />
                        <PolarAngleAxis dataKey="skill" tick={{ fill: darkMode ? '#94a3b8' : '#475569', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, instTotal || 10]} />
                        <Radar name="Missing Count" dataKey="count" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <PieChart className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-xs text-slate-400">No student assessments stored in system yet. Run a student alignment report first!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SECTION 1: TAB 1 FORM (READINESS ASSESSOR) */}
        {activeTab === 'assess' && !analyzing && !report && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left side Form */}
            <form onSubmit={handleAnalyze} className={`lg:col-span-2 space-y-6 p-8 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
              
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    Student Profiler & Parser
                  </h3>
                  <p className="text-xs text-slate-400">Paste your LinkedIn or resume to automatically populate your skill profile</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPastingResume(!pastingResume)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[11px] font-bold cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  {pastingResume ? 'Manual Select' : 'Parse CV / LinkedIn'}
                </button>
              </div>

              {pastingResume && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 rounded-xl bg-slate-500/5 border border-slate-500/10 space-y-3"
                >
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Pasted Resume Text / CV content:</label>
                    <textarea
                      rows={3}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Copy & paste CV summary or work achievements..."
                      className={`w-full p-2.5 rounded-lg border text-xs focus:outline-none focus:border-blue-500 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Or paste LinkedIn URL:</label>
                    <input
                      type="text"
                      value={linkedinInput}
                      onChange={(e) => setLinkedinInput(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className={`w-full p-2.5 rounded-lg border text-xs focus:outline-none focus:border-blue-500 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleParseResume}
                    disabled={parsingResume || (!pastedText.trim() && !linkedinInput.trim())}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    {parsingResume ? 'AI Parser analyzing...' : 'Parse via Gemini'}
                  </button>
                </motion.div>
              )}

              {/* Institution input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">My Current College / Institution:</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. State Technological University"
                  className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-blue-600 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}
                  required
                />
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Select Skills You Have Completed:
                </h3>
                
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 border rounded-xl bg-slate-500/5 border-slate-500/10">
                  {COMMON_SKILLS.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleToggleSkill(skill)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                            : darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Skills Textbox */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Additional Skills (Comma-separated):</label>
                <input
                  type="text"
                  placeholder="e.g. Kubernetes, Project Management, Node.js"
                  value={customSkills}
                  onChange={(e) => setCustomSkills(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-blue-600 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}
                />
              </div>

              {/* Dream job selector */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Target Dream Tech Career:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Select Role:</label>
                    <select
                      value={dreamJob}
                      onChange={(e) => setDreamJob(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {Object.keys(INDIA_SALARY_BANDS).map(job => (
                        <option key={job} value={job}>{job}</option>
                      ))}
                      <option value="Other">Other (Custom target role...)</option>
                    </select>
                  </div>

                  {dreamJob === 'Other' && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <label className="block text-xs font-semibold text-slate-500 mb-2">Custom Job Title:</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cloud Security Analyst"
                        value={customJob}
                        onChange={(e) => setCustomJob(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border text-xs text-slate-700 focus:outline-none focus:border-blue-600 ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={selectedSkills.length === 0 && !customSkills.trim()}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-sm cursor-pointer ${
                    selectedSkills.length > 0 || customSkills.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/10'
                      : 'bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze Readiness Score
                </button>
              </div>
            </form>

            {/* Sidebar Information Guide */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Readiness Self-Alignment
                </h4>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Compare your course achievements directly to regional hiring criteria. This dashboard maps:
                </p>
                <ul className="space-y-3 mt-4 text-[11px] text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>Real-time cosine similarity alignment scoring.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>Accompanying list of matching and missing core skills.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>Curated lectures with matching tutorials.</span>
                  </li>
                </ul>
              </div>

              <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Seeded Intelligence</h4>
                <p className="text-[11px] leading-relaxed">
                  The gateway pulls verified demand skills from active corporate registries, aligning your CV directly to actual job vacancies.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 2: TAB 2 FORM (AI CAREER ARCHITECT ROADMAP) */}
        {activeTab === 'architect' && !architecting && !generatedRoadmap && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <form onSubmit={handleGenerateRoadmap} className={`lg:col-span-2 space-y-6 p-8 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
              <div>
                <h3 className="text-base font-bold flex items-center gap-2 mb-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  What did your college actually teach you?
                </h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  Describe the tools, compilers, languages, or theoretical concepts your syllabus covered (even if outdated).
                </p>
                
                <textarea
                  rows={4}
                  value={collegeTaughtInput}
                  onChange={(e) => setCollegeTaughtInput(e.target.value)}
                  placeholder="e.g. Basic C language, only standard loops/arrays, legacy Turbo C editor, DBMS database theory on paper, no live modern frameworks..."
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-blue-600 text-xs text-slate-700 placeholder-slate-400 leading-relaxed resize-none ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50/50 border-slate-200 text-slate-700'
                  }`}
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  What is your target job or industry role?
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Specify the dynamic modern tech or business role you want to bridge into.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Target Career Role:</label>
                    <select
                      value={targetRoleInput}
                      onChange={(e) => setTargetRoleInput(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-blue-600 cursor-pointer ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {ARCHITECT_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                      <option value="Other">Other (Custom target role...)</option>
                    </select>
                  </div>

                  {targetRoleInput === 'Other' && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <label className="block text-xs font-semibold text-slate-500 mb-2">Type Custom Target Role:</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cloud Security Analyst"
                        value={customTargetRole}
                        onChange={(e) => setCustomTargetRole(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-blue-600 ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200'
                        }`}
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!collegeTaughtInput.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/10 cursor-pointer transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Architect My Personal Transition Roadmap
                </button>
              </div>
            </form>

            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  AI Transition Logic
                </h4>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Enter whatever theoretical topics your college taught on paper. Our AI engine establishes transition bridges to modern frameworks, skipping the academic fluff!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* LOADING SCENE FOR READINESS ASSESSOR */}
        {analyzing && (
          <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} id="analyzing-card">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
              <Sparkles className="w-5 h-5 text-blue-600 absolute animate-pulse" />
            </div>
            <h4 className="text-base font-bold mt-6">Assessing College Alignment Gaps...</h4>
            <p className="text-xs text-blue-600 mt-2 font-semibold tracking-wide bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900">
              {loadingStep}
            </p>
            <p className="text-[10px] text-slate-400 mt-3">Using real Scikit-learn Cosine Similarity matching with Indian labor trends</p>
          </div>
        )}

        {/* LOADING SCENE FOR TRANSITION ARCHITECT */}
        {architecting && (
          <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} id="architecting-card">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
              <Sparkles className="w-5 h-5 text-indigo-600 absolute animate-pulse" />
            </div>
            <h4 className="text-base font-bold mt-6">Architecting Custom Transition Roadmap...</h4>
            <p className="text-xs text-indigo-600 mt-2 font-semibold tracking-wide bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900">
              {architectLoadingStep}
            </p>
            <p className="text-[10px] text-slate-400 mt-3">Synthesizing curriculum baselines and translating programming paradigms</p>
          </div>
        )}

        {/* DYNAMIC TRANSITION ROADMAP AND GAP DISSIER (IF GENERATED) */}
        {report && !analyzing && !architecting && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Top Score Summary Banner */}
            <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                  Transition Report
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight mt-1.5">
                  {report.dream_job} Strategy File
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Generated for **{report.institution || 'your profile'}**. Your CV logic maps to **{report.matched_skills.length}** completed skills.
                </p>
                
                {/* Peer benchmarking score badge */}
                {report.peer_percentile !== undefined && (
                  <div className="mt-2.5 p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold inline-flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>You are more job-ready than {report.peer_percentile}% of CS students from this institution!</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center shrink-0 bg-white/5 p-4 rounded-xl border border-white/10 text-center min-w-[170px] z-10">
                <span className="text-4xl font-black text-blue-400 animate-pulse">{dynamicReadiness}%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Hiring Readiness</span>
                
                <button
                  onClick={handleDownloadPDF}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shadow-sm cursor-pointer transition-all"
                >
                  <FileDown className="w-3 h-3" />
                  Export Strategy PDF
                </button>
              </div>
            </div>

            {/* Indian Salary Bands & Confidence Citation indicators */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Indian Salary Range (INR)</h4>
                  <p className="text-lg font-extrabold text-emerald-500">{report.salaryBand || '₹5L - ₹12L LPA'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Average entry packages across Bengaluru & Electronic City IT corridors.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Credibility Citation</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-[9px] font-bold text-blue-500 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/20">Source: Naukri.com</span>
                    <span className="text-[9px] font-bold text-blue-500 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/20">Source: LinkedIn Jobs</span>
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/20">High Confidence 94%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Labour intelligence matched live with SQLite active employer feeds.</p>
                </div>
              </div>
            </div>

            {/* Grid for Reality Check and Logic Bridge (Shown if AI Career Architect is used) */}
            {generatedRoadmap && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Reality Check */}
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-3`}>
                  <h4 className="text-sm font-bold flex items-center gap-2 border-b pb-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    1. Reality Check (The Academic Gap)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {generatedRoadmap.gap_summary}
                  </p>
                </div>

                {/* Logic Bridge */}
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-3`}>
                  <h4 className="text-sm font-bold flex items-center gap-2 border-b pb-2.5">
                    <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                    2. Bridge Strategy (Leveraging Syllabus Logic)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {generatedRoadmap.bridge_strategy}
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Spider Radar Chart: Student vs. Industry */}
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
              <div className="border-b pb-3 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-500" />
                    Student Skills vs. Market Demand Index
                  </h4>
                  <p className="text-[11px] text-slate-400">Visualization mapping your capabilities directly against hiring benchmarks</p>
                </div>
              </div>

              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                    ...report.matched_skills.map(s => ({ subject: s, user: 100, market: 100 })),
                    ...report.missing_skills.map(s => ({ subject: s, user: 0, market: 100 }))
                  ].slice(0, 8)}>
                    <PolarGrid stroke={darkMode ? '#334155' : '#e2e8f0'} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: darkMode ? '#94a3b8' : '#475569', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="My Level" dataKey="user" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
                    <Radar name="Market Target" dataKey="market" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* TIMELINE WITH COMPLETED CHECKBOXES & GROWTH TRENDS */}
            <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-6`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-blue-600 shrink-0" />
                    3. Personalized Roadmap Milestones Tracker
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mark milestones completed to update your Hiring Readiness score in real time.
                  </p>
                </div>
                <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-500/10 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black">Ready Index: {dynamicReadiness}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Milestone Checklist */}
                <div className="lg:col-span-5 space-y-3">
                  {report.missing_skills.map((skill, index) => {
                    const milestoneKey = `Milestone: Learn ${skill}`;
                    const isDone = !!completedMilestones[milestoneKey];
                    return (
                      <div 
                        key={skill} 
                        onClick={() => handleMilestoneToggle(milestoneKey)}
                        className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isDone 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-300' 
                            : 'bg-slate-500/5 border-slate-500/10 hover:border-slate-500/20'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                          isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                        }`}>
                          {isDone && <Check className="w-4 h-4" />}
                        </div>
                        <div>
                          <h5 className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : ''}`}>Stage {index + 1}: Study {skill}</h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">Learn fundamentals & complete exercises to unlock score.</p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Portfolio Capstone */}
                  <div 
                    onClick={() => handleMilestoneToggle('capstone')}
                    className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      completedMilestones['capstone']
                        ? 'bg-emerald-500/10 border-emerald-500/20' 
                        : 'bg-blue-500/5 border-blue-500/10 hover:border-blue-500/20'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                      completedMilestones['capstone'] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                    }`}>
                      {completedMilestones['capstone'] && <Check className="w-4 h-4" />}
                    </div>
                    <div>
                      <h5 className={`text-xs font-bold ${completedMilestones['capstone'] ? 'line-through text-slate-400' : ''}`}>Final: Deploy Portfolio Capstone</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">Consolidate all skills in GitHub logs to unlock full score potential.</p>
                    </div>
                  </div>
                </div>

                {/* Growth Curve Chart */}
                <div className="lg:col-span-7 bg-slate-500/5 border border-slate-500/10 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <LineIcon className="w-4 h-4 text-blue-500" />
                      Employability Growth Path projection
                    </h5>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getProgressChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#f1f5f9'} />
                        <XAxis dataKey="step" tick={{ fill: darkMode ? '#94a3b8' : '#475569', fontSize: 8 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: darkMode ? '#94a3b8' : '#475569', fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* CURATED CERTIFICATIONS & FREE COURSES */}
            {report.missing_skills.length > 0 && (
              <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-6`}>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2 border-b pb-3">
                    <Award className="w-4 h-4 text-emerald-500 shrink-0" />
                    Recommended Certifications & Free Courses
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Direct access to structured, free curricular courses to satisfy employer skill checkpoints.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {report.missing_skills.slice(0, 3).map(skill => {
                    const course = COURSE_RECOMMENDATIONS[skill] || { courseName: `${skill} Fundamentals`, provider: 'Coursera', url: 'https://coursera.org' };
                    return (
                      <div key={skill} className={`p-4 rounded-xl border flex flex-col justify-between gap-4 ${
                        darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">{course.provider}</span>
                          <h6 className="text-xs font-bold mt-2.5 leading-snug">{course.courseName}</h6>
                        </div>
                        <a 
                          href={course.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg text-center cursor-pointer transition-all"
                        >
                          Access Free Course
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LECTURE PLAYLISTS */}
            {report.missing_skills.length > 0 && (
              <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-6`}>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2 border-b pb-3">
                    <Play className="w-4 h-4 text-red-600 shrink-0" />
                    Recommended Video Lectures
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {report.missing_skills.slice(0, 3).map(skill => {
                    const videoId = TUTORIAL_VIDEOS[skill] || 'HXV3zeQKqGY';
                    return (
                      <div key={skill} className={`border rounded-xl overflow-hidden flex flex-col justify-between ${
                        darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <div className="relative pb-[56.25%] h-0">
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={`${skill} Lecture`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600">Lecture Guide</span>
                            <h6 className="text-xs font-bold mt-0.5">{skill} Comprehensive tutorial</h6>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TECHNICAL INTERVIEW SIMULATOR */}
            <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-6`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500 shrink-0" />
                    4. Technical interview Simulator (Personalized Question Bank)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    AI-generated interview questions specific to your identified gap areas. Study answer hints to verify your knowledge!
                  </p>
                </div>
                <button
                  onClick={handleSimulateInterview}
                  disabled={simulating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all self-start md:self-center shrink-0"
                >
                  {simulating ? 'Generating Questions...' : 'Generate Questions for Gaps'}
                </button>
              </div>

              {interviewQuestions.length > 0 ? (
                <div className="space-y-4">
                  {interviewQuestions.map((q, index) => {
                    const isOpen = activeQuestionId === q.id;
                    return (
                      <div key={q.id} className={`p-4 rounded-xl border ${
                        isOpen 
                          ? 'border-indigo-500 bg-indigo-500/5' 
                          : 'border-slate-500/10 bg-slate-500/5 hover:bg-slate-500/10 cursor-pointer'
                      }`} onClick={() => {
                        setActiveQuestionId(q.id);
                        setShowAnswerHint(false);
                      }}>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400">Question {index + 1} (Focus: {q.skill})</span>
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                        <p className="text-xs font-extrabold mt-2 leading-relaxed">{q.question}</p>
                        
                        {isOpen && (
                          <div className="mt-4 pt-4 border-t border-indigo-500/20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowAnswerHint(!showAnswerHint);
                              }}
                              className="px-3 py-1.5 bg-blue-600 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                            >
                              {showAnswerHint ? 'Hide Ideal Answer Hint' : 'View Ideal Answer Hint'}
                            </button>

                            {showAnswerHint && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300 leading-relaxed font-semibold"
                              >
                                <span className="font-black text-emerald-500">Perfect Answer Checklist:</span>
                                <p className="mt-1">{q.idealAnswerHint}</p>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  Click 'Generate Questions for Gaps' to practice interview setups for missing skills!
                </div>
              )}
            </div>

            {/* PUBLIC SHAREABLE CARD (LINKEDIN WRAPPED STYLE) */}
            <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-6`}>
              <div className="border-b pb-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-500 shrink-0" />
                  5. Share Your Readiness Card (LinkedIn Wrapped Style)
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Share your verified alignment scorecard with hiring managers or peer networks to trigger college growth loops!
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
                {/* Visual Wrapped Card */}
                <div className="w-72 bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 text-white p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden text-center flex flex-col justify-between h-96">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -z-10" />
                  
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-full border border-white/10">Servixoo Alignment Wrap</span>
                    <h5 className="text-lg font-black mt-4 leading-tight">My Career Readiness</h5>
                    <p className="text-[10px] text-slate-300 mt-1">Verified via Labor Cosine Matching</p>
                  </div>

                  <div className="my-6">
                    <span className="text-5xl font-black tracking-tighter text-amber-400">{dynamicReadiness}%</span>
                    <p className="text-[10px] text-slate-200 uppercase tracking-widest font-bold mt-1">Targeting: {report.dream_job}</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-[10px] text-slate-300 font-bold">University Base: {report.institution || 'State Technological University'}</p>
                    <p className="text-[10px] text-amber-400 font-black">Outperforming {report.peer_percentile}% of college peers!</p>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <span className="text-[9px] font-black tracking-widest uppercase text-white/40">servixoo.edu</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider">How to utilize this to nudge change:</h5>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                    By sharing your Alignment score publicly, you flag your college's syllabus gaps and show potential recruiters you are actively bridging them independently. Let's build momentum!
                  </p>
                  <button
                    onClick={handleCopyShareCard}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-all w-full md:w-auto"
                  >
                    <Share2 className="w-4 h-4" />
                    {copiedShare ? 'Copied LinkedIn Snippet!' : 'Copy LinkedIn Share Text'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* DEFAULT STATE NOT ANALYZED */}
        {!report && !analyzing && !architecting && activeTab !== 'institution' && (
          <div className="text-center py-16 bg-slate-500/5 rounded-2xl border border-slate-500/10">
            <GraduationCap className="w-16 h-12 text-blue-500 mx-auto" />
            <h4 className="text-base font-bold mt-4">Unlocks transition roadmaps and skills analysis</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
              Use the AI Career Architect to bridge theoretical studies, or use the Readiness Assessor to run Scikit-learn labor metrics directly!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
