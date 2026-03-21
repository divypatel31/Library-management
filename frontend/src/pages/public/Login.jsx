import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import { Library, ArrowRight, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

    const res = await login(email, password);
    
    setIsLoading(false);
    
    if (res.success) {
       const roleMap = {
         admin: '/admin',
         librarian: '/librarian',
         student: '/student',
         professor: '/professor',
       };
       navigate(roleMap[res.role?.toLowerCase()] || '/');
    } else {
       setError(res.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 flex items-center justify-center p-6">
      
      {/* Abstract Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-3xl animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-cyan-200/40 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] rounded-full bg-fuchsia-200/40 blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, type: 'spring' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel rounded-[2rem] p-8 sm:p-10 relative overflow-hidden shadow-xl shadow-slate-200/50 bg-white border border-slate-100">
          
          <div className="flex flex-col items-center mb-8">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5 shrink-0 shadow-sm"
            >
              <Library className="text-indigo-600" size={32} strokeWidth={2.5} />
            </motion.div>
            <h2 className="text-2xl font-display font-bold text-slate-800 tracking-tight mb-2">WWelcome to Liborbit</h2>
            <p className="text-slate-500 text-center text-sm">
              Sign in to manage library resources securely.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Proper UI Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-rose-50 text-rose-600 p-3.5 rounded-xl border border-rose-100 flex items-start gap-3 text-sm font-medium mb-1">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <div>
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              {/* Forgot Password Link added here */}
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className={`w-full py-3.5 mt-4 rounded-xl flex items-center justify-center gap-2 text-white font-semibold transition-all shadow-md
                 ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 cursor-pointer'}
              `}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Log In
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs font-medium text-slate-400">
             Accounts are provisioned internally. Contact an Administrator or Librarian for access.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;