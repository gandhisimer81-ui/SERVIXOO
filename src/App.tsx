import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import StudentSkillsForm from './pages/StudentSkillsForm';
import ReadinessReportView, { AnalysisResult } from './pages/ReadinessReportView';
import CurriculumAnalyzer from './pages/CurriculumAnalyzer';
import SkillTrends from './pages/SkillTrends';
import AuthPage from './pages/AuthPage';
import FloatingAiHelper from './components/FloatingAiHelper';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import { saveAssessmentToFirestore } from './firebase';

function AppContent() {
  const { isDark } = useTheme();
  const { currentUser, userProfile, loading: authLoading, updateUserSkillsAndRole } = useAuth();

  // Guest exploration toggle (evaluators can explore as guest or sign in/up)
  const [isGuest, setIsGuest] = useState<boolean>(false);

  // Active navigation tab: exactly the 5 hackathon routes
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Student intake form states
  const [selectedRole, setSelectedRole] = useState<string>('Python Developer');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Python', 'C', 'SQL', 'DSA']);
  const [customText, setCustomText] = useState<string>('');

  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize form states when Firestore user profile loads
  useEffect(() => {
    if (userProfile) {
      if (userProfile.targetRole) {
        setSelectedRole(userProfile.targetRole);
      }
      if (userProfile.selectedSkills && userProfile.selectedSkills.length > 0) {
        setSelectedSkills(userProfile.selectedSkills);
      }
    }
  }, [userProfile]);

  // Pre-seed sample analysis so judges immediately see live 3D galaxy & readiness if they go to report
  useEffect(() => {
    async function initSample() {
      try {
        const res = await fetch('/api/student/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collegeSkills: userProfile?.selectedSkills || ['Python', 'C', 'SQL', 'DSA'],
            dreamJob: userProfile?.targetRole || 'Python Developer',
            customInput: 'Completed DBMS lab and procedural programming in college'
          })
        });
        if (res.ok) {
          const data = await res.json();
          setAnalysisResult(data);
        }
      } catch (err) {
        console.log('Initial sample load note:', err);
      }
    }
    initSample();
  }, [userProfile?.targetRole]);

  // Handle student skill-gap submission (Piece 1 -> Piece 2 -> Piece 3)
  const handleSubmitSkills = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    // Merge checklist skills and free-text custom skills
    const freeTextSkills = customText
      .split(/[,;\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const combinedSkills = Array.from(new Set([...selectedSkills, ...freeTextSkills]));

    if (combinedSkills.length === 0) {
      setErrorMsg('Please select at least one skill or type your coursework in the free-text field.');
      setIsAnalyzing(false);
      return;
    }

    try {
      const response = await fetch('/api/student/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collegeSkills: combinedSkills,
          dreamJob: selectedRole,
          customInput: customText
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis engine returned status ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data);

      // Store in Firebase Firestore if user is authenticated
      if (currentUser) {
        try {
          await saveAssessmentToFirestore(currentUser.uid, {
            targetRole: selectedRole,
            skillsDeclared: combinedSkills,
            customCoursework: customText,
            readinessScore: data.readiness_score || 0,
            matchedSkills: data.matched_skills || [],
            missingSkills: data.missing_skills || [],
            timestamp: new Date().toISOString()
          });

          await updateUserSkillsAndRole(selectedRole, combinedSkills, data.readiness_score || 0);
          console.log('[Firestore] Assessment and user details successfully saved.');
        } catch (dbErr) {
          console.error('Error saving assessment to Firestore:', dbErr);
        }
      }

      // Smoothly navigate to Readiness Report
      setActiveTab('readiness');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'An error occurred while computing the Scikit-learn readiness score.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    setSelectedRole('Python Developer');
    setSelectedSkills(['Python', 'C', 'SQL', 'DSA']);
    setCustomText('Learned procedural programming in C, basic Python, and relational database management.');
    handleSubmitSkills();
  };

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-center p-6 transition-colors ${
        isDark ? 'bg-[#060B18] text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}>
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="font-extrabold text-base tracking-tight text-white">Connecting to Servixoo Cloud...</h3>
        <p className="text-xs text-slate-400 mt-1">Verifying Firebase Authentication & Firestore session</p>
      </div>
    );
  }

  // Show Auth Page if not signed in and not continuing as guest
  if (!currentUser && !isGuest) {
    return <AuthPage onGuestContinue={() => setIsGuest(true)} />;
  }

  return (
    <div 
      className={`flex h-screen w-screen max-w-full overflow-hidden transition-colors font-sans antialiased relative ${
        isDark ? 'bg-[#080E1E] text-slate-100' : 'bg-slate-50 text-slate-800'
      }`} 
      id="servixoo-app-root"
    >
      {/* Persistent Sidebar navigation panel */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        targetRole={selectedRole}
        readinessScore={analysisResult?.readiness_score}
        onRequireAuth={() => setIsGuest(false)}
      />

      {/* Main Content Stage Area with responsive containment */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative w-full min-w-0" id="main-content-stage">
        
        {/* Sticky top bar with logo, breadcrumb, and dark mode toggle */}
        <Header 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            if (tab === 'auth') {
              setIsGuest(false);
            } else {
              setActiveTab(tab);
            }
          }} 
          onMenuClick={() => setSidebarOpen(true)}
          targetRole={selectedRole}
          readinessScore={analysisResult?.readiness_score}
        />

        {/* Selected sub-page view stage area with smooth transitions */}
        <div className="flex-1 overflow-hidden relative flex flex-col w-full">
          {activeTab === 'dashboard' && (
            <Dashboard onNavigate={setActiveTab} />
          )}

          {activeTab === 'skills_form' && (
            <StudentSkillsForm
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              selectedSkills={selectedSkills}
              setSelectedSkills={setSelectedSkills}
              customText={customText}
              setCustomText={setCustomText}
              onSubmit={handleSubmitSkills}
              isAnalyzing={isAnalyzing}
              errorMsg={errorMsg}
            />
          )}

          {activeTab === 'readiness' && (
            <ReadinessReportView
              report={analysisResult}
              onGoToForm={() => setActiveTab('skills_form')}
              onLoadSample={handleLoadSample}
              targetRole={selectedRole}
            />
          )}

          {activeTab === 'curriculum' && (
            <CurriculumAnalyzer />
          )}

          {activeTab === 'trends' && (
            <SkillTrends />
          )}
        </div>

        {/* Floating AI Career helper / chat drawer */}
        <FloatingAiHelper targetRole={selectedRole} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
