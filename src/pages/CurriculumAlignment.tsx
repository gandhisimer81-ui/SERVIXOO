import { useState } from 'react';
import { FileSpreadsheet, Play, CheckCircle2, ChevronRight, AlertCircle, Sparkles, Cpu, BookOpen, Layers } from 'lucide-react';

export default function CurriculumAlignment() {
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<any | null>(null);

  const currentCurriculum = [
    { code: 'CS101', name: 'C Programming', sem: 1 },
    { code: 'CS201', name: 'Data Structures', sem: 3 },
    { code: 'CS301', name: 'Database Management', sem: 5 },
    { code: 'CS401', name: 'Web Development (HTML/CSS)', sem: 6 }
  ];

  const industryDemand = [
    { skill: 'Python', volume: 'Critical', source: 'Recruiter Feeds' },
    { skill: 'AI/ML Essentials', volume: 'Critical', source: 'Regional Clusters' },
    { skill: 'Cloud Computing', volume: 'High', source: 'SaaS Platforms' },
    { skill: 'Data Analytics', volume: 'High', source: 'Analytics Clusters' },
    { skill: 'Generative AI', volume: 'Surging', source: 'Hiring Indexes' }
  ];

  const handleAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setRecommendations({
        score: 42, // Curriculum Alignment alignment index (low is poor)
        updates: [
          { old: 'C Programming', change: 'Add modern Python programming modules & practical syntaxes in Sem 1.' },
          { old: 'Data Structures', change: 'Introduce hands-on Machine Learning algorithms, vectors, and NumPy/Pandas.' },
          { old: 'Database Management', change: 'Introduce cloud databases (NoSQL, VectorDB, Firebase, PostgreSQL).' },
          { old: 'Web Development', change: 'Add React, TypeScript, and modern Cloud Containerization (Docker, AWS) laboratory.' }
        ],
        additions: [
          'Add Cloud Computing laboratory course (Sem 6)',
          'Integrate Capstone Industry Co-op projects mapped to regional corporate hiring indexes',
          'Deploy dedicated elective on Generative AI and Large Language Model fine-tuning foundations'
        ]
      });
      setAnalyzing(false);
    }, 1300);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50" id="curriculum-page">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
            Institutional Audit &bull; Syllabus Advisor
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Curriculum Alignment</h2>
          <p className="text-slate-500 text-sm mt-0.5">Auditing legacy academic syllabus guidelines to re-align with commercial job-hiring metrics.</p>
        </div>

        <button 
          onClick={handleAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/10 transition-all cursor-pointer text-sm"
        >
          <Cpu className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Evaluating Academic Gaps...' : 'AI Curriculum Recommendation'}
        </button>
      </div>

      {/* Legacy Syllabus vs Industry Demands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Academic Syllabus */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-600" />
            <h3 className="font-bold text-slate-800 text-sm">Legacy Curriculum Matrix</h3>
          </div>
          <div className="flex flex-col gap-2">
            {currentCurriculum.map((course, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{course.code}</span>
                  <p className="font-bold text-slate-800 mt-0.5">{course.name}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded">
                  Semester {course.sem}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Demand */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-800 text-sm">Hiring Matrix Demands</h3>
          </div>
          <div className="flex flex-col gap-2">
            {industryDemand.map((d, idx) => (
              <div key={idx} className="flex items-center justify-between bg-blue-50/20 border border-blue-100/30 p-3.5 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-blue-500 font-bold uppercase">{d.source}</span>
                  <p className="font-bold text-slate-800 mt-0.5">{d.skill}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  d.volume === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {d.volume}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Before vs After Recommendations output */}
      {recommendations ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-6 animate-fadeIn" id="curriculum-recommendation-panel">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Syllabus Re-Alignment Framework
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Calculated substitutions to maximize regional student employability indices.</p>
            </div>
            <div className="bg-rose-50 border border-rose-100/60 px-4 py-2 rounded-xl text-center">
              <span className="text-xl font-black text-rose-600">{recommendations.score}%</span>
              <p className="text-[9px] uppercase font-bold text-rose-500 mt-0.5">Baseline Alignment Score</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Substitution Table */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Before-vs-After Substitutions</h4>
              <div className="flex flex-col gap-3">
                {recommendations.updates.map((up: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-start gap-3 text-xs shadow-sm/30">
                    <div className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-500 line-through mb-1">{up.old}</p>
                      <p className="font-semibold text-slate-800 text-xs bg-indigo-50/60 border border-indigo-100 p-2.5 rounded-lg text-indigo-950 mt-1">
                        {up.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Additions */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Course Injection Blocks</h4>
              <div className="flex flex-col gap-3">
                {recommendations.additions.map((add: string, idx: number) => (
                  <div key={idx} className="bg-emerald-50/40 border border-emerald-100/60 p-4 rounded-xl flex items-start gap-3 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="font-semibold text-emerald-950">{add}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mb-2 animate-pulse" />
          <h4 className="font-bold text-slate-600 text-sm">Awaiting Syllabus Diagnostic Ingestion</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">Click AI Curriculum Recommendation to run structural Cosine Similarity checks on college syllabi against active job markets.</p>
        </div>
      )}

    </div>
  );
}
