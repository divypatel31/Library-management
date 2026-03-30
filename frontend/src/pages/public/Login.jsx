import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Library, ArrowRight, AlertCircle, CheckCircle2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

// 1. IMPORT YOUR LOCAL IMAGE HERE
import libraryBg from '../../assets/library.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const roleMap = {
        admin: '/admin',
        librarian: '/librarian',
        student: '/student',
        professor: '/professor',
      };
      navigate(roleMap[user.role?.toLowerCase()] || '/');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields to continue.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    const res = await login(email, password);
    
    setIsLoading(false);
    
    if (res && res.success) {
       setSuccess('Verification complete! Logging you in...');
       
       setTimeout(() => {
         const roleMap = {
           admin: '/admin',
           librarian: '/librarian',
           student: '/student',
           professor: '/professor',
         };
         navigate(roleMap[res.role?.toLowerCase()] || '/');
       }, 1500);
    } else {
       setError(res?.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      
      {/* 2. USE YOUR LOCAL IMAGE AS THE BACKGROUND */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${libraryBg})`, 
        }}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/85 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 relative overflow-hidden shadow-2xl shadow-black/40 border border-white/50">
          
          <div className="flex flex-col items-center mb-8">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center mb-5 shrink-0 shadow-sm backdrop-blur-md"
            >
              <Library className="text-indigo-700" size={32} strokeWidth={2.5} />
            </motion.div>
            <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight mb-2">Welcome to LibOrbit</h2>
            <p className="text-slate-600 text-center text-sm font-medium">
              Sign in to manage library resources securely.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-rose-50/90 backdrop-blur-sm text-rose-700 p-3.5 rounded-xl border border-rose-200 flex items-start gap-3 text-sm font-bold mb-1 shadow-sm">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}

              {success && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-emerald-50/90 backdrop-blur-sm text-emerald-700 p-3.5 rounded-xl border border-emerald-200 flex items-start gap-3 text-sm font-bold mb-1 shadow-sm">
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 sm:text-sm transition-all text-slate-900 bg-white/60 backdrop-blur-sm font-medium placeholder-slate-400"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 sm:text-sm transition-all text-slate-900 bg-white/60 backdrop-blur-sm font-medium placeholder-slate-400"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-indigo-600 focus:outline-none transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-sm font-bold text-indigo-700 hover:text-indigo-800 transition-colors drop-shadow-sm">
                  Forgot password?
                </Link>
              </div>
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className={`w-full py-3.5 mt-2 rounded-xl flex items-center justify-center gap-2 text-white font-bold transition-all shadow-lg
                 ${isLoading && !success ? 'bg-indigo-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/30 cursor-pointer'}
              `}
            >
              {isLoading && !success ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Log In
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-300/50 text-center text-xs font-bold text-slate-500">
             Accounts are provisioned internally.<br/>Contact an Administrator or Librarian for access.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;