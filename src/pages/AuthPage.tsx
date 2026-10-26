import { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  GraduationCap, 
  Building, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useTheme } from '../components/ThemeContext';
import Logo from '../components/Logo';

interface AuthPageProps {
  onGuestContinue?: () => void;
}

export default function AuthPage({ onGuestContinue }: AuthPageProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { isDark } = useTheme();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('State Technological University (VTU)');
  const [course, setCourse] = useState('B.Tech Computer Science');
  const [targetRole, setTargetRole] = useState('Python Developer');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!email || !password) {
          throw new Error('Please provide both email and password.');
        }
        await signIn(email, password);
      } else {
        if (!email || !password || !name) {
          throw new Error('Please fill in your name, email, and password.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await signUp(email, password, name, college, course, targetRole);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password. If you do not have an account, switch to Sign Up.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Please switch to Sign In.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password is too weak. Please use at least 6 characters.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (role: 'student_cs' | 'student_bba') => {
    if (role === 'student_cs') {
      setEmail('rahul.sharma@vtu.ac.in');
      setPassword('StudentPass123!');
      setName('Rahul Sharma');
      setCollege('Visvesvaraya Technological University (VTU)');
      setCourse('B.Tech Computer Science');
      setTargetRole('Python Developer');
    } else {
      setEmail('priya.patel@delhi.ac.in');
      setPassword('StudentPass123!');
      setName('Priya Patel');
      setCollege('Delhi University Faculty of Management');
      setCourse('BBA (Marketing)');
      setTargetRole('Digital Marketer');
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 transition-colors relative overflow-hidden ${
      isDark ? 'bg-[#060B18] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`} id="servixoo-auth-page">
      
      {/* Background visual glow mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 font-black text-white text-lg">
              S
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              SERVIXOO
            </h1>
          </div>
          
          <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Sign in to track your skill gaps, save your college curriculum evaluations, and store your personalized AI career roadmap in Firestore.
          </p>
        </div>

        {/* Main Card */}
        <div className={`rounded-2xl border p-6 sm:p-8 shadow-2xl transition-all ${
          isDark ? 'bg-[#0E1A38] border-slate-750' : 'bg-white border-slate-200'
        }`}>
          
          {/* Mode Tabs */}
          <div className={`grid grid-cols-2 p-1 rounded-xl border mb-6 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up & Register
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Sign Up specific fields */}
            {mode === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <label className={`block text-[11px] font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 ${
                        isDark 
                          ? 'bg-[#080E1E] border-slate-700 text-white focus:ring-cyan-500/40' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-blue-500/40'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      College / University
                    </label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. VTU"
                      className={`w-full px-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 ${
                        isDark 
                          ? 'bg-[#080E1E] border-slate-700 text-white focus:ring-cyan-500/40' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-blue-500/40'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Current Course
                    </label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className={`w-full px-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 cursor-pointer ${
                        isDark 
                          ? 'bg-[#080E1E] border-slate-700 text-white focus:ring-cyan-500/40' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-blue-500/40'
                      }`}
                    >
                      <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                      <option value="BBA (Marketing)">BBA (Marketing)</option>
                      <option value="MCA / IT">MCA / IT</option>
                      <option value="B.Sc Data Science">B.Sc Data Science</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={`block text-[11px] font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Target Dream Job
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 cursor-pointer ${
                      isDark 
                        ? 'bg-[#080E1E] border-slate-700 text-white focus:ring-cyan-500/40' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-blue-500/40'
                    }`}
                  >
                    <option value="Python Developer">Python Developer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Digital Marketer">Digital Marketer</option>
                    <option value="Backend Engineer">Backend Engineer</option>
                  </select>
                </div>
              </>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className={`block text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 ${
                    isDark 
                      ? 'bg-[#080E1E] border-slate-700 text-white focus:ring-cyan-500/40' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-blue-500/40'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className={`block text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 ${
                    isDark 
                      ? 'bg-[#080E1E] border-slate-700 text-white focus:ring-cyan-500/40' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-blue-500/40'
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Firebase...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to Servixoo' : 'Create Account & Store Details'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>or</span>
            <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`w-full py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-white' 
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

        </div>

        {/* Security badge */}
        <div className={`text-center flex items-center justify-center gap-2 text-[11px] ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured via Firebase Auth & Firestore Rules (servixoo-831b0)</span>
        </div>

      </div>
    </div>
  );
}
