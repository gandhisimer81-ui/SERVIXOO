import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LabourMarket from './pages/LabourMarket';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import CurriculumAnalyzer from './pages/CurriculumAnalyzer';
import StudentJobMatching from './pages/StudentJobMatching';
import WorkforceReports from './pages/WorkforceReports';
import { ArrowLeft, Play, ChevronRight, ChevronLeft, Sparkles, Cpu } from 'lucide-react';

const DEMO_STEPS = [
  {
    step: 1,
    title: 'Executive Intelligence Dashboard',
    desc: 'Review overarching regional metrics, emerging competencies, and baseline alignment parameters.',
    tab: 'dashboard'
  },
  {
    step: 2,
    title: 'Labour Market Feed & NLP Extraction',
    desc: 'Analyse real-time job vacancies and test the natural language processing (NLP) sandbox on custom recruiter text.',
    tab: 'market'
  },
  {
    step: 3,
    title: 'Individual Skill-Gap Detection',
    desc: 'Diagnose Rahul Sharma\'s legacy profile against active AI/ML requirements and generate career paths.',
    tab: 'skill_gap'
  },
  {
    step: 4,
    title: 'Syllabus Alignment advisor',
    desc: 'Audit academic computer science curriculum templates and inject AI recommended substitutions.',
    tab: 'curriculum'
  },
  {
    step: 5,
    title: 'Calculated Student Job Matching',
    desc: 'Review internships matched directly to the student\'s expanded capabilities with computed alignment percentages.',
    tab: 'job_matching'
  },
  {
    step: 6,
    title: 'Recruiter Feedback Loop',
    desc: 'Examine the unified circular pipeline connecting recruiters, skills, academics, and upskilling in a single ecosystem.',
    tab: 'reports'
  },
  {
    step: 7,
    title: 'Territorial reports Generation',
    desc: 'Analyze region-wide skills shortages, select Chandigarh/Bengaluru corridors, and compile the final workforce audit briefing.',
    tab: 'reports'
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'student' | 'institution' | 'employer' | 'admin' | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Guided Demo States
  const [demoActive, setDemoActive] = useState<boolean>(false);
  const [demoStepIndex, setDemoStepIndex] = useState<number>(0);

  const handleLogin = (role: 'student' | 'institution' | 'employer' | 'admin', startDemo?: boolean) => {
    setUserRole(role);
    setIsAuthenticated(true);
    
    if (startDemo) {
      setDemoActive(true);
      setDemoStepIndex(0);
      setActiveTab('dashboard');
    } else {
      // Direct routing based on persona
      if (role === 'student') {
        setActiveTab('skill_gap');
      } else if (role === 'institution') {
        setActiveTab('curriculum');
      } else if (role === 'employer') {
        setActiveTab('market');
      } else {
        setActiveTab('dashboard');
      }
    }
  };

  const handleNextStep = () => {
    if (demoStepIndex < DEMO_STEPS.length - 1) {
      const nextIdx = demoStepIndex + 1;
      setDemoStepIndex(nextIdx);
      setActiveTab(DEMO_STEPS[nextIdx].tab);
    }
  };

  const handlePrevStep = () => {
    if (demoStepIndex > 0) {
      const prevIdx = demoStepIndex - 1;
      setDemoStepIndex(prevIdx);
      setActiveTab(DEMO_STEPS[prevIdx].tab);
    }
  };

  // Logout / Return to Landing
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setDemoActive(false);
  };

  if (!isAuthenticated) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-700 antialiased relative" id="servixoo-app-root">
      {/* Sidebar navigation panel */}
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => {
        setActiveTab(tab);
        // Sync with demo step if clicked manually
        const matchedStep = DEMO_STEPS.findIndex(s => s.tab === tab);
        if (matchedStep !== -1 && demoActive) {
          setDemoStepIndex(matchedStep);
        }
      }} />

      {/* Main Content Stage Area */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative" id="main-content-stage">
        
        {/* Global navigation header containing the search bar */}
        <div className="relative">
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Quick Landing Page Return link */}
          <button 
            onClick={handleLogout}
            className="absolute right-6 top-5 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer z-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Selected sub-page view stage area */}
        <div className="flex-1 overflow-hidden relative flex flex-col pb-24">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'market' && <LabourMarket />}
          {activeTab === 'skill_gap' && <SkillGapAnalysis />}
          {activeTab === 'curriculum' && <CurriculumAnalyzer />}
          {activeTab === 'job_matching' && <StudentJobMatching />}
          {activeTab === 'reports' && <WorkforceReports />}
        </div>

        {/* Guided Demo Walkthrough Panel overlay at the bottom */}
        {demoActive ? (
          <div className="absolute bottom-6 left-6 right-6 bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl z-40 animate-fadeIn" id="guided-demo-tour-bar">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 shrink-0">
                <Cpu className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                    Guided Demo Walkthrough
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Step {demoStepIndex + 1} of {DEMO_STEPS.length}</span>
                </div>
                <h4 className="font-bold text-sm text-white mt-1">{DEMO_STEPS[demoStepIndex].title}</h4>
                <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">{DEMO_STEPS[demoStepIndex].desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={handlePrevStep}
                disabled={demoStepIndex === 0}
                className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button 
                onClick={handleNextStep}
                disabled={demoStepIndex === DEMO_STEPS.length - 1}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs py-2 px-4 rounded-lg transition-all cursor-pointer shadow-md shadow-blue-500/10"
              >
                Next Step
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={() => setDemoActive(false)}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider ml-2 cursor-pointer"
              >
                Exit Tour
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-6 right-6 z-40">
            <button 
              onClick={() => {
                setDemoActive(true);
                setDemoStepIndex(0);
                setActiveTab('dashboard');
              }}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 text-slate-100 font-bold px-4 py-3 rounded-xl shadow-lg hover:scale-[1.01] transition-all cursor-pointer text-xs"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Launch Guided Tour
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
