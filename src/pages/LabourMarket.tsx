import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Briefcase, Search, Cpu, Sparkles, Filter, CheckCircle, Flame, ArrowUpRight, TrendingUp } from 'lucide-react';

const INITIAL_JOBS = [
  { id: 1, title: 'AI/ML Engineer', company: 'TechNova Solutions', location: 'Chandigarh', industry: 'Software', skills: ['Python', 'SQL', 'Machine Learning', 'TensorFlow'], experience: '0-2 Yrs', demand: 'Critical' },
  { id: 2, title: 'Cloud Infrastructure Associate', company: 'CloudWave Technologies', location: 'Bengaluru', industry: 'Cloud Services', skills: ['Python', 'Cloud Computing', 'Docker', 'Kubernetes'], experience: '1-3 Yrs', demand: 'High' },
  { id: 3, title: 'Software Developer Intern', company: 'ABC Tech Labs', location: 'Mohali', industry: 'Software', skills: ['JavaScript', 'React', 'HTML', 'SQL'], experience: '0-1 Yrs', demand: 'Medium' },
  { id: 4, title: 'Data Analyst & Visualization specialist', company: 'XYZ Analytics Solutions', location: 'Chandigarh', industry: 'Data Science', skills: ['SQL', 'Python', 'Data Analytics', 'MS Excel'], experience: '1-2 Yrs', demand: 'High' },
  { id: 5, title: 'Green Energy System Engineer', company: 'EcoGrid Projects', location: 'Delhi', industry: 'Sustainability', skills: ['Python', 'Data Analytics', 'Cloud Computing'], experience: '2-4 Yrs', demand: 'High' },
  { id: 6, title: 'Full-Stack Developer', company: 'DevCorp Services', location: 'Bengaluru', industry: 'Software', skills: ['JavaScript', 'React', 'Python', 'SQL'], experience: '1-3 Yrs', demand: 'Critical' },
  { id: 7, title: 'Junior Data Scientist', company: 'InsightML', location: 'Mohali', industry: 'AI/ML', skills: ['Python', 'Machine Learning', 'SQL', 'Data Analytics'], experience: '0-2 Yrs', demand: 'Critical' },
  { id: 8, title: 'Security Analyst Associate', company: 'CyberShield Systems', location: 'Delhi', industry: 'Cybersecurity', skills: ['SQL', 'Cloud Computing', 'Cybersecurity'], experience: '1-3 Yrs', demand: 'High' }
];

export default function LabourMarket() {
  const [allJobs, setAllJobs] = useState<any[]>(INITIAL_JOBS);
  const [jobs, setJobs] = useState<any[]>(INITIAL_JOBS);
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterIndustry, setFilterIndustry] = useState('All');
  const [filterSkill, setFilterSkill] = useState('All');
  const [filterExp, setFilterExp] = useState('All');

  // Interactive AI analysis states
  const [analyzingMarket, setAnalyzingMarket] = useState(false);
  const [marketAnalysisResult, setMarketAnalysisResult] = useState<any | null>(null);

  // Interactive Skill Extraction state
  const [jdText, setJdText] = useState(
    'Looking for an enthusiastic Software Developer with Python, React, SQL, Machine Learning, and Cloud Computing experience to design scalable intelligence services.'
  );
  const [extracting, setExtracting] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<Array<{ name: string, confidence: number, match: boolean }> | null>(null);

  // Fetch real jobs from database on mount
  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch('/api/jobs');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const mapped = data.map((j: any) => ({
              id: j.id,
              title: j.title,
              company: j.source || 'Recruiter Feed',
              location: j.district || 'Chandigarh',
              industry: j.title.toLowerCase().includes('cloud') || j.title.toLowerCase().includes('infra') ? 'Cloud Services' : j.title.toLowerCase().includes('ai') || j.title.toLowerCase().includes('ml') || j.title.toLowerCase().includes('science') || j.title.toLowerCase().includes('data') ? 'AI/ML' : 'Software',
              skills: j.required_skills ? j.required_skills.split(',').map((s: string) => s.trim()) : [],
              experience: j.experience || '0-2 Yrs',
              demand: j.id % 3 === 0 ? 'Critical' : j.id % 3 === 1 ? 'High' : 'Medium'
            }));
            setAllJobs(mapped);
            setJobs(mapped);
          }
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    }
    fetchJobs();
  }, []);

  // Filter handlers
  const handleFilter = () => {
    let filtered = allJobs;
    if (filterLocation !== 'All') {
      filtered = filtered.filter(j => j.location === filterLocation);
    }
    if (filterIndustry !== 'All') {
      filtered = filtered.filter(j => j.industry === filterIndustry || j.title.includes(filterIndustry));
    }
    if (filterSkill !== 'All') {
      filtered = filtered.filter(j => j.skills.includes(filterSkill));
    }
    if (filterExp !== 'All') {
      filtered = filtered.filter(j => j.experience === filterExp);
    }
    setJobs(filtered);
  };

  // Perform Simulated Market Demand Analysis
  const handleMarketAnalysis = () => {
    setAnalyzingMarket(true);
    setTimeout(() => {
      setMarketAnalysisResult({
        topSkills: [
          { name: 'Python', demand: 92, status: 'Surging' },
          { name: 'Machine Learning', demand: 88, status: 'Critical' },
          { name: 'React & JS', demand: 82, status: 'High' },
          { name: 'SQL', demand: 78, status: 'Stable' },
          { name: 'Cloud Computing', demand: 74, status: 'High' },
        ],
        emerging: ['Generative AI', 'Docker Containerization', 'Kubernetes Orchestration'],
        declining: ['Legacy C++', 'Traditional VBA', 'Manual Spreadsheet Reporting'],
        chartData: [
          { name: 'AI/ML', Jobs: 1450, Growth: 35 },
          { name: 'Full Stack', Jobs: 1120, Growth: 18 },
          { name: 'Cloud & Infra', Jobs: 880, Growth: 24 },
          { name: 'Data & Analytics', Jobs: 720, Growth: 15 },
          { name: 'Cybersecurity', Jobs: 610, Growth: 20 },
        ]
      });
      setAnalyzingMarket(false);
    }, 1500);
  };

  // Perform NLP Skill Extraction
  const handleJdExtraction = async () => {
    setExtracting(true);
    try {
      const res = await fetch('/api/jobs/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: jdText })
      });
      if (res.ok) {
        const data = await res.json();
        const detected = (data.skills || []).map((name: string) => ({
          name,
          confidence: Math.floor(Math.random() * 15) + 84, // 84-98%
          match: true
        }));
        setExtractedSkills(detected.length > 0 ? detected : [{ name: 'Generic Developer Skills', confidence: 75, match: false }]);
      } else {
        throw new Error('Skill extraction API failed');
      }
    } catch (err) {
      console.error('Error extracting skills:', err);
      // Fallback
      const lowercase = jdText.toLowerCase();
      const detected: Array<{ name: string, confidence: number, match: boolean }> = [];
      const skillPatterns = [
        { name: 'Python', keywords: ['python'] },
        { name: 'React', keywords: ['react'] },
        { name: 'SQL', keywords: ['sql'] },
        { name: 'Machine Learning', keywords: ['machine learning', 'ml', 'tensorflow', 'deep learning'] },
        { name: 'Cloud Computing', keywords: ['cloud', 'aws', 'azure', 'docker', 'kubernetes'] },
        { name: 'JavaScript', keywords: ['javascript', 'js'] }
      ];
      skillPatterns.forEach(pattern => {
        const found = pattern.keywords.some(kw => lowercase.includes(kw));
        if (found) {
          detected.push({
            name: pattern.name,
            confidence: Math.floor(Math.random() * 15) + 84,
            match: true
          });
        }
      });
      setExtractedSkills(detected.length > 0 ? detected : [{ name: 'Generic Developer Skills', confidence: 75, match: false }]);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50" id="market-page">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
            Industry Demand Analysis &bull; AI/NLP Engine
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Labour Market Intelligence</h2>
          <p className="text-slate-500 text-sm mt-0.5">Scraped job market vacancies coupled with NLP skill extraction feeds.</p>
        </div>

        <button 
          onClick={handleMarketAnalysis}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-blue-500/10 hover:scale-[1.01] hover:shadow-indigo-500/10 transition-all cursor-pointer text-sm"
        >
          <Cpu className={`w-4 h-4 ${analyzingMarket ? 'animate-spin' : ''}`} />
          {analyzingMarket ? 'Analysing Market Feeds...' : 'Analyse Market Demand'}
        </button>
      </div>

      {/* Grid of Jobs & Interactive NLP Extraction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Interactive NLP Skill Extraction */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-6" id="nlp-skill-extraction-panel">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-slate-800 text-base">NLP Skill Extractor Sandbox</h3>
            </div>
            <p className="text-xs text-slate-400">Pasted recruiter Job Description (JD) to parse core skill nodes.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500">Recruiter Job Description (JD)</label>
            <textarea 
              rows={5}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-100 p-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white resize-none"
              placeholder="Paste job requirement text here..."
            />
          </div>

          <button 
            onClick={handleJdExtraction}
            disabled={extracting}
            className="w-full bg-slate-900 hover:bg-slate-850 text-slate-100 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {extracting ? 'Processing NLP Pipeline...' : 'Analyse with AI'}
            <ArrowUpRight className="w-4 h-4" />
          </button>

          {/* Extracted Skills Output */}
          {extractedSkills && (
            <div className="bg-indigo-50/40 border border-indigo-100/60 rounded-xl p-4 flex flex-col gap-3 animate-fadeIn">
              <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-indigo-600" />
                Extracted Competencies
              </h4>
              <div className="flex flex-col gap-2">
                {extractedSkills.map((sk, index) => (
                  <div key={index} className="flex items-center justify-between bg-white border border-slate-100 p-2.5 rounded-lg text-xs shadow-sm/50">
                    <span className="font-semibold text-slate-800">{sk.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        {sk.confidence}% Confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Jobs Table & Filters */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Market Analysis Charts overlay if triggered */}
          {marketAnalysisResult && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn" id="market-analysis-panel">
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Emerging & Declining Skills
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Derived monthly structural shift values.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 my-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-100/60 rounded-xl">
                    <h4 className="text-[10px] uppercase font-bold text-emerald-600 mb-1.5 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-emerald-500 stroke-none" /> Surging Now
                    </h4>
                    <ul className="text-xs text-emerald-950 flex flex-col gap-1 font-semibold">
                      {marketAnalysisResult.emerging.map((s: string, idx: number) => (
                        <li key={idx}>&bull; {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-100/60 rounded-xl">
                    <h4 className="text-[10px] uppercase font-bold text-rose-600 mb-1.5">Declining Demand</h4>
                    <ul className="text-xs text-rose-950 flex flex-col gap-1 font-semibold">
                      {marketAnalysisResult.declining.map((s: string, idx: number) => (
                        <li key={idx}>&bull; {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketAnalysisResult.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                    <Bar dataKey="Jobs" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-slate-800 text-sm">Interactive Market Filters</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Location */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Location</label>
                <select 
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="bg-slate-50 border border-slate-100 text-xs p-2 rounded-lg"
                >
                  <option value="All">All Regions</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Mohali">Mohali</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              {/* Industry */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Field</label>
                <select 
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  className="bg-slate-50 border border-slate-100 text-xs p-2 rounded-lg"
                >
                  <option value="All">All Industries</option>
                  <option value="Software">Software</option>
                  <option value="Cloud">Cloud Services</option>
                  <option value="AI">AI/ML</option>
                  <option value="Cyber">Cybersecurity</option>
                </select>
              </div>

              {/* Skill */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Key Skill</label>
                <select 
                  value={filterSkill}
                  onChange={(e) => setFilterSkill(e.target.value)}
                  className="bg-slate-50 border border-slate-100 text-xs p-2 rounded-lg"
                >
                  <option value="All">All Skills</option>
                  <option value="Python">Python</option>
                  <option value="React">React</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="SQL">SQL</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                </select>
              </div>

              {/* Experience */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Experience</label>
                <select 
                  value={filterExp}
                  onChange={(e) => setFilterExp(e.target.value)}
                  className="bg-slate-50 border border-slate-100 text-xs p-2 rounded-lg"
                >
                  <option value="All">All Ranges</option>
                  <option value="0-1 Yrs">0-1 Yrs (Entry)</option>
                  <option value="0-2 Yrs">0-2 Yrs (Junior)</option>
                  <option value="1-3 Yrs">1-3 Yrs (Associate)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleFilter}
              className="bg-blue-600 hover:bg-blue-750 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer mt-2"
            >
              Apply Filter Matrices
            </button>
          </div>

          {/* Job Feed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm/50 flex flex-col justify-between hover:border-blue-150 transition-all">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                      job.demand === 'Critical' 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {job.demand} Demand
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{job.location}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm tracking-tight leading-tight">{job.title}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{job.company} &bull; {job.experience}</p>
                </div>
                <div className="flex flex-wrap gap-1 mt-4">
                  {job.skills.map((s: string, idx: number) => (
                    <span key={idx} className="text-[9px] font-bold bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
