import { useState } from 'react';
import { 
  Briefcase, 
  BookOpen, 
  Sparkles, 
  Check, 
  ArrowRight, 
  UserCheck, 
  AlertCircle,
  HelpCircle,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../components/ThemeContext';

export const DREAM_JOB_ROLES = [
  'Python Developer',
  'Data Analyst',
  'Digital Marketer',
  'Backend Engineer'
] as const;

export const COLLEGE_SKILLS_CHECKLIST = [
  'MS Excel',
  'Python',
  'C',
  'SQL',
  'DSA',
  'Communication',
  'Java',
  'HTML & CSS',
  'Git',
  'Machine Learning'
];

interface SampleStudent {
  label: string;
  role: string;
  skills: string[];
  notes: string;
}

const SAMPLE_PROFILES: SampleStudent[] = [
  {
    label: 'Rahul Sharma (B.Tech CS)',
    role: 'Python Developer',
    skills: ['Python', 'C', 'SQL', 'DSA'],
    notes: 'Learned C and basic Python in college semesters 1-3. Has basic SQL knowledge.'
  },
  {
    label: 'Priya Patel (BBA Graduate)',
    role: 'Digital Marketer',
    skills: ['Communication', 'MS Excel', 'HTML & CSS'],
    notes: 'Completed digital business projects, knows MS Excel and social strategy.'
  },
  {
    label: 'Arjun Verma (Self-taught / CS)',
    role: 'Data Analyst',
    skills: ['Python', 'SQL', 'MS Excel', 'Communication'],
    notes: 'Took database management lab, comfortable with basic data aggregation.'
  }
];

interface StudentSkillsFormProps {
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  customText: string;
  setCustomText: (text: string) => void;
  onSubmit: () => void;
  isAnalyzing: boolean;
  errorMsg: string | null;
}

export default function StudentSkillsForm({
  selectedRole,
  setSelectedRole,
  selectedSkills,
  setSelectedSkills,
  customText,
  setCustomText,
  onSubmit,
  isAnalyzing,
  errorMsg
}: StudentSkillsFormProps) {
  const { isDark } = useTheme();

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSelectSample = (sample: SampleStudent) => {
    setSelectedRole(sample.role);
    setSelectedSkills(sample.skills);
    setCustomText(sample.notes);
  };

  return (
    <div className={`w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8 transition-colors ${
      isDark ? 'bg-[#080E1E] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`} id="student-skills-form-page">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-slate-700/40">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2 border shadow-xs bg-cyan-950/60 border-cyan-700/50 text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Piece 1 of 5 • Student Intake Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              My Skills & Dream Job
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Tell us what you studied in college. Servixoo's Scikit-learn ML engine computes your readiness score against real-time market requirements.
            </p>
          </div>

          {/* Quick Preset Selector for Judges */}
          <div className="shrink-0 flex flex-col gap-1.5">
            <span className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              1-Click Demo Profiles
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROFILES.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(p)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                    selectedRole === p.role && selectedSkills.length === p.skills.length
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-xs'
                      : isDark
                        ? 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {p.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Intake Form Card */}
        <div className={`rounded-2xl border p-6 sm:p-8 shadow-xl transition-all ${
          isDark 
            ? 'bg-[#0E1A38] border-slate-750 shadow-cyan-950/20' 
            : 'bg-white border-slate-200 shadow-slate-200'
        }`}>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="space-y-6"
          >
            {/* Field 1: Dream Job Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                Target Dream Job Role
                <span className="text-red-400">*</span>
              </label>
              
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 ${
                    isDark 
                      ? 'bg-[#080E1E] border-slate-700 text-white focus:ring-cyan-500/50 focus:border-cyan-400' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-blue-500/50 focus:border-blue-500'
                  }`}
                >
                  {DREAM_JOB_ROLES.map((role) => (
                    <option key={role} value={role} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                      {role}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Locked to 4 hackathon roles: Python Developer, Data Analyst, Digital Marketer, Backend Engineer.</span>
              </div>
            </div>

            {/* Field 2: College Skills Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  What You Learned In College (Checklist)
                  <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {selectedSkills.length} selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {COLLEGE_SKILLS_CHECKLIST.map((skill) => {
                  const isChecked = selectedSkills.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left ${
                        isChecked
                          ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-300 border-emerald-500/60 shadow-xs'
                          : isDark
                            ? 'bg-[#080E1E] text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate">{skill}</span>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ml-1.5 transition-colors ${
                        isChecked 
                          ? 'bg-emerald-500 text-slate-950 font-bold' 
                          : isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-200'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field 3: Free-Text Coursework Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Additional Coursework, Electives, or Lab Projects (Free-Text)
              </label>
              <textarea
                rows={3}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="e.g. Completed DBMS lab with MySQL queries, microprocessors with 8085 assembly, basic data visualization in Excel..."
                className={`w-full px-4 py-3 rounded-xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 resize-none ${
                  isDark 
                    ? 'bg-[#080E1E] border-slate-700 text-white placeholder-slate-500 focus:ring-cyan-500/50 focus:border-cyan-400' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-500/50 focus:border-blue-500'
                }`}
              />
              <p className="text-[11px] text-slate-400">
                You can write free-form text or comma-separated subjects. Scikit-learn TF-IDF vectorizes both automatically.
              </p>
            </div>

            {/* Error Message with smooth animation */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Action CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Runs Python Scikit-learn Cosine Similarity on submission</span>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Computing Vector Match...</span>
                  </>
                ) : (
                  <>
                    <span>Calculate Readiness & Skill Gap</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Feature summary preview banner */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 pt-2`}>
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E1A38]/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h4 className="font-bold text-xs text-cyan-400">Real ML Vectorization</h4>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Transforms syllabus coursework and market requirements into TF-IDF cosine similarity vectors in Python.
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E1A38]/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h4 className="font-bold text-xs text-emerald-400">Interactive 3D Galaxy</h4>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Orbit your target career nucleus with Three.js. Drag to inspect matched vs missing skill nodes.
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0E1A38]/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h4 className="font-bold text-xs text-amber-400">PDF Report Generation</h4>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Download a real ReportLab PDF with your circular score, missing competencies, and 5-section AI roadmap.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
