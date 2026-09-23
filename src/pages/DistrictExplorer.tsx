import { useState, useEffect } from 'react';
import ThreeGlobe from '../components/ThreeGlobe';
import { District, Job } from '../types';
import { Landmark, AlertTriangle, CheckCircle, Briefcase, Eye, ArrowRight } from 'lucide-react';

export default function DistrictExplorer() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [distRes, jobsRes] = await Promise.all([
          fetch('/api/districts'),
          fetch('/api/jobs')
        ]);
        const distData = await distRes.json();
        const jobsData = await jobsRes.json();
        
        setDistricts(distData);
        setJobs(jobsData);
        
        // Auto-select the first district on load
        if (distData.length > 0) {
          setSelectedDistrictId(distData[0].id);
        }
      } catch (err) {
        console.error('Error fetching explorer data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-semibold text-sm animate-pulse">Initializing 3D Spatial Grid...</p>
      </div>
    );
  }

  // Get selected district
  const selectedDistrict = districts.find((d) => d.id === selectedDistrictId) || districts[0];

  // Get jobs in this district
  const districtJobs = jobs.filter((j) => j.district === (selectedDistrict?.name || ''));

  return (
    <div className="flex-1 h-full flex overflow-hidden bg-slate-900 text-slate-100" id="district-explorer-page">
      {/* 3D Visualizer Canvas (Takes 60% width) */}
      <div className="flex-1 relative h-full flex flex-col p-6">
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Landmark className="w-6 h-6 text-blue-500" />
            3D Spatial Skill-Gap Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing district skill-demand misalignment inside Bangalore corridors.
          </p>
        </div>

        {/* Three.js Globe container */}
        <div className="w-full h-full flex-1 mt-14">
          <ThreeGlobe
            districts={districts}
            selectedDistrictId={selectedDistrictId}
            onSelectDistrict={(id) => setSelectedDistrictId(id)}
          />
        </div>
      </div>

      {/* Explorer Side Panel (Takes 40% width / 450px) */}
      <aside className="w-[450px] h-full bg-[#111827] border-l border-slate-800 shrink-0 flex flex-col p-6 overflow-y-auto justify-between select-none">
        {selectedDistrict ? (
          <div className="flex flex-col gap-6">
            {/* Header / Meta */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
                District Profile
              </span>
              <h3 className="text-xl font-bold text-white mt-3.5 tracking-tight">{selectedDistrict.name}</h3>
            </div>

            {/* Gap Score Alert banner */}
            <div className={`p-4 rounded-xl border flex items-center gap-4 ${
              selectedDistrict.gap_score > 60 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
            }`}>
              <div className={`p-2.5 rounded-lg ${
                selectedDistrict.gap_score > 60 ? 'bg-rose-500/10' : 'bg-amber-500/10'
              }`}>
                {selectedDistrict.gap_score > 60 ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Misalignment Gap</span>
                <span className="text-2xl font-bold mt-0.5">{selectedDistrict.gap_score}%</span>
              </div>
            </div>

            {/* Top demanded skills chips */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Demanded Skills</h4>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedDistrict.top_demand_skills.split(',').map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700/60"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* List of active Jobs scraped */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-slate-400" />
                Active Hiring Demands ({districtJobs.length})
              </h4>
              <div className="flex flex-col gap-3 mt-1.5">
                {districtJobs.length > 0 ? (
                  districtJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition duration-150 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">{job.title}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">{job.source} • {job.scraped_at}</span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.required_skills.split(',').slice(0, 3).map((sk, idx) => (
                          <span key={idx} className="text-[9px] font-semibold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
                            {sk.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No job postings tracked in this district.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 italic text-sm">
            Please select a district on the globe to explore details.
          </div>
        )}

        {/* Quick district switcher buttons inside Side Panel */}
        <div className="border-t border-slate-800/80 pt-5 mt-5">
          <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            Quick Selector
          </h4>
          <div className="grid grid-cols-1 gap-1.5">
            {districts.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDistrictId(d.id)}
                className={`text-xs text-left px-3.5 py-2.5 rounded-xl transition duration-150 flex items-center justify-between cursor-pointer ${
                  d.id === selectedDistrictId
                    ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30'
                    : 'bg-slate-900/50 hover:bg-slate-800/80 text-slate-400 border border-slate-800/30'
                }`}
              >
                <span className="truncate">{d.name}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
