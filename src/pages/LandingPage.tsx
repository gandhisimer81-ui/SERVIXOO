import { GraduationCap, Building, ShieldAlert, Sparkles, ArrowRight, Play, Cpu } from 'lucide-react';
import Logo from '../components/Logo';

interface LandingPageProps {
  onLogin: (role: 'student' | 'institution' | 'employer' | 'admin', startDemo?: boolean) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen w-screen bg-slate-50 flex flex-col justify-between overflow-x-hidden select-none font-sans" id="servixoo-landing">
      {/* Top Header navbar */}
      <header className="w-full max-w-7xl mx-auto px-8 h-20 flex items-center justify-between border-b border-slate-100 bg-white shadow-sm/50 rounded-b-2xl">
        <div className="flex items-center gap-3">
          <Logo theme="light" hideSubtext={true} className="h-10 w-auto" />
        </div>
        <div className="flex items-center gap-2">
          {/* SIH Presentation label removed */}
        </div>
      </header>
 
      {/* Main Hero & Portals Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-8 py-16 flex flex-col items-center justify-center gap-12">
        <div className="text-center max-w-3xl flex flex-col items-center">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            AI-Driven Regional Skills Co-Alignment
          </div>
          
          <Logo theme="light" className="h-20 w-auto mb-4" />
          
          <p className="text-xl font-bold text-slate-700 max-w-xl mb-3">
            “AI-Driven Labour Market Intelligence & Curriculum Alignment”
          </p>
          <p className="text-slate-500 text-sm max-w-lg leading-relaxed">
            Connecting industry demand, education curriculum alignment, and student workforce skills seamlessly through unified NLP feedback loops.
          </p>
        </div>
 
        {/* Portal Entry Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl" id="landing-roles-grid">
          {/* Card 1: Student */}
          <button 
            onClick={() => onLogin('student')}
            className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 text-left transition-all cursor-pointer flex flex-col justify-between h-48"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Persona 1</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-1">Student Portal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">View Rahul Sharma's skills, track gaps, and match with recommended AI jobs.</p>
            </div>
          </button>
 
          {/* Card 2: Institution */}
          <button 
            onClick={() => onLogin('institution')}
            className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 text-left transition-all cursor-pointer flex flex-col justify-between h-48"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Persona 2</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-1">Institution Portal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Analyse institution curriculum against hiring metrics and inject AI recommendations.</p>
            </div>
          </button>
 
          {/* Card 3: Employer */}
          <button 
            onClick={() => onLogin('employer')}
            className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 text-left transition-all cursor-pointer flex flex-col justify-between h-48"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Persona 3</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-1">Employer Loop</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Analyse job descriptions with natural language processing and view feedback loop.</p>
            </div>
          </button>
        </div>
 
        {/* Demo buttons section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4" id="landing-actions">
          <button 
            onClick={() => onLogin('admin', true)}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white text-white" />
            Start Guided Demo Flow
          </button>
          
          <button 
            onClick={() => onLogin('admin', false)}
            className="flex items-center gap-2 bg-slate-900 text-slate-100 font-bold px-8 py-4 rounded-xl shadow-lg shadow-slate-950/20 hover:bg-slate-850 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            Enter Full Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
 
      {/* Bottom info banner */}
      <footer className="w-full bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 font-medium">
        &copy; 2026 SERVIXOO &bull; AI-Driven Labour Market Intelligence & Curriculum Alignment
      </footer>
    </div>
  );
}
