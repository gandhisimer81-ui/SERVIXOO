import { useState, useEffect } from 'react';
import { TrendingUp, FileText, Download, MapPin, Sparkles, Award, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';

const INITIAL_DISTRICTS_DATA = [
  { id: 'chandigarh', name: 'Chandigarh', jobs: 1240, topSkills: ['Python', 'SQL', 'Data Analytics'], emerging: 'AI/ML Modeling', shortages: 'Senior ML Engineers' },
  { id: 'mohali', name: 'Mohali', jobs: 890, topSkills: ['React', 'JavaScript', 'SQL'], emerging: 'Full-Stack Node.js', shortages: 'DevOps & Kubes' },
  { id: 'delhi', name: 'Delhi', jobs: 4210, topSkills: ['Python', 'Cloud Computing', 'Cybersecurity'], emerging: 'SaaS Architecture', shortages: 'Data Security Specialists' },
  { id: 'bengaluru', name: 'Bengaluru', jobs: 12450, topSkills: ['Python', 'Machine Learning', 'Docker', 'Kubernetes'], emerging: 'Generative AI & LLMs', shortages: 'NLP Architects' },
  { id: 'hyderabad', name: 'Hyderabad', jobs: 8720, topSkills: ['Cloud Computing', 'SQL', 'React'], emerging: 'Multi-Cloud Deployments', shortages: 'AWS Engineers' },
  { id: 'pune', name: 'Pune', jobs: 5410, topSkills: ['Java', 'Python', 'SQL'], emerging: 'Automotive Embedded Systems', shortages: 'Embedded IoT Coder' },
  { id: 'mumbai', name: 'Mumbai', jobs: 9810, topSkills: ['Data Analytics', 'MS Excel', 'SQL'], emerging: 'Financial FinTech Models', shortages: 'Quant Analysts' }
];

export default function WorkforceReports() {
  const [districts, setDistricts] = useState<any[]>(INITIAL_DISTRICTS_DATA);
  const [selectedDistrictId, setSelectedDistrictId] = useState('chandigarh');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportResult, setReportResult] = useState<any | null>(null);

  useEffect(() => {
    async function fetchDistricts() {
      try {
        const res = await fetch('/api/districts');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const mapped = data.map((d: any) => ({
              id: d.name.toLowerCase().replace(/\s+/g, '_'),
              name: d.name,
              jobs: d.name.toLowerCase() === 'bengaluru' ? 12450 : d.name.toLowerCase() === 'chandigarh' ? 1240 : d.name.toLowerCase() === 'delhi' ? 4210 : d.name.toLowerCase() === 'mohali' ? 890 : 1500 + (d.id % 5) * 800,
              topSkills: d.top_demand_skills ? d.top_demand_skills.split(',').map((s: string) => s.trim()) : ['Python', 'SQL'],
              emerging: d.name.toLowerCase() === 'chandigarh' ? 'AI/ML Modeling' : d.name.toLowerCase() === 'bengaluru' ? 'Generative AI & LLMs' : 'Cloud Native Computing',
              shortages: d.name.toLowerCase() === 'chandigarh' ? 'Senior ML Engineers' : d.name.toLowerCase() === 'bengaluru' ? 'NLP Architects' : 'Full Stack Leads'
            }));
            setDistricts(mapped);
            // Default to first loaded district
            if (mapped.length > 0) {
              setSelectedDistrictId(mapped[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching districts for reporting:', err);
      }
    }
    fetchDistricts();
  }, []);

  const selectedDist = districts.find(d => d.id === selectedDistrictId) || districts[0] || INITIAL_DISTRICTS_DATA[0];

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    setTimeout(() => {
      setReportResult({
        title: 'SERVIXOO Region-Wide Skill Alignment Report',
        date: 'Sept 2026',
        scope: 'North-Zone Tech Corridors',
        metrics: {
          scrapedJds: 45210,
          curriculaAligned: 14,
          avgPlacementLift: '24.5%',
          unificationScore: '86%'
        }
      });
      setGeneratingReport(false);
    }, 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50" id="reports-page">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
            Feedback Loop &bull; Territorial Matrices
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Territorial Heatmap & Reports</h2>
          <p className="text-slate-500 text-sm mt-0.5">Explore active district demand parameters and trigger curriculum alignment outputs.</p>
        </div>
      </div>

      {/* Grid of Heatmap vs Feedback Flowchart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* District Skill Heatmap Selector */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500 animate-pulse" />
              Regional Skill Heatmap Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Select a regional corporate cluster to query shortage parameters.</p>
          </div>

          {/* Locations Picker */}
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {districts.map(d => (
              <button 
                key={d.id}
                onClick={() => setSelectedDistrictId(d.id)}
                className={`w-full text-left text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedDistrictId === d.id 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10' 
                    : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{d.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  selectedDistrictId === d.id ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {d.jobs} Jobs
                </span>
              </button>
            ))}
          </div>

          {/* Selected District Parameters Display */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">District Core Node</span>
              <h4 className="font-bold text-slate-800 text-sm mt-0.5">{selectedDist.name} Corridor</h4>
            </div>
            
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Primary Core Skills:</span>
                <span className="font-bold text-slate-800 text-right">{selectedDist.topSkills.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Emerging:</span>
                <span className="font-bold text-indigo-600 text-right">{selectedDist.emerging}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Shortage Focus:</span>
                <span className="font-bold text-rose-600 text-right">{selectedDist.shortages}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Employer Feedback Loop Diagram */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-6" id="feedback-loop-panel">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              SERVIXOO Feedback Loop
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">The core cyclical co-alignment of industrial requirements with public academics.</p>
          </div>

          {/* Visual Grid Loop Flow */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {/* Box 1 */}
              <div className="p-3 bg-blue-50 border border-blue-100/60 rounded-xl flex flex-col items-center justify-center">
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1">Recruiters</span>
                <p className="text-xs font-extrabold text-blue-950">Job Requirements</p>
              </div>

              {/* Box 2 */}
              <div className="p-3 bg-indigo-50 border border-indigo-100/60 rounded-xl flex flex-col items-center justify-center">
                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">NLP Engine</span>
                <p className="text-xs font-extrabold text-indigo-950">AI Skill Extraction</p>
              </div>

              {/* Box 3 */}
              <div className="p-3 bg-rose-50 border border-rose-100/60 rounded-xl flex flex-col items-center justify-center">
                <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider mb-1">Diagnostic</span>
                <p className="text-xs font-extrabold text-rose-950">Skill Gap Score</p>
              </div>

              {/* Box 4 */}
              <div className="p-3 bg-emerald-50 border border-emerald-100/60 rounded-xl flex flex-col items-center justify-center">
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-1">Affiliated syllabus</span>
                <p className="text-xs font-extrabold text-emerald-950">Curriculum Update</p>
              </div>
            </div>

            {/* Downward Loop connections */}
            <div className="flex justify-center my-1">
              <span className="text-xs font-bold text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Continuous Talent Pipeline Re-Alignment Feed
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {/* Box 5 */}
              <div className="p-3 bg-emerald-50 border border-emerald-100/60 rounded-xl flex flex-col items-center justify-center">
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-1">Upskilling</span>
                <p className="text-xs font-extrabold text-emerald-950">Student Upskilling</p>
              </div>

              {/* Box 6 */}
              <div className="p-3 bg-indigo-50 border border-indigo-100/60 rounded-xl flex flex-col items-center justify-center">
                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">Talent Connect</span>
                <p className="text-xs font-extrabold text-indigo-950">Job Matching</p>
              </div>

              {/* Box 7 */}
              <div className="p-3 bg-blue-50 border border-blue-100/60 rounded-xl flex flex-col items-center justify-center">
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1">Recruiters</span>
                <p className="text-xs font-extrabold text-blue-950">Employer Feedback</p>
              </div>

              {/* Box 8 */}
              <div className="p-3 bg-slate-900 border border-slate-950 rounded-xl flex flex-col items-center justify-center text-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Output</span>
                <p className="text-xs font-extrabold">Next-Gen Placement</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Workforce Alignment Report section */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-6" id="workforce-report-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Workforce Skill Alignment Report Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Synthesize an authoritative, cross-district talent gaps briefing card.</p>
          </div>

          <button 
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 text-slate-100 font-bold px-5 py-3 rounded-xl text-xs transition-all cursor-pointer shadow-md"
          >
            <Download className={`w-4 h-4 ${generatingReport ? 'animate-spin' : ''}`} />
            {generatingReport ? 'Compiling Metrics...' : 'Generate Industry Skill Report'}
          </button>
        </div>

        {reportResult && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center py-2 animate-fadeIn">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-2xl font-black text-blue-600">{reportResult.metrics.scrapedJds}</span>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Scraped JDs</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-2xl font-black text-blue-600">{reportResult.metrics.curriculaAligned}</span>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Curricula Aligned</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-2xl font-black text-emerald-600">{reportResult.metrics.avgPlacementLift}</span>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Placement Lift</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-2xl font-black text-indigo-600">{reportResult.metrics.unificationScore}</span>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Unification Index</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
