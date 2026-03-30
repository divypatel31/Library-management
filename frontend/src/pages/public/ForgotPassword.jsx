import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, Lock, ArrowRight, ArrowLeft, CheckCircle2, RefreshCw, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

// 1. IMPORT YOUR LOCAL IMAGE HERE
import libraryBg from '../../assets/library.jpg';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Added Eye toggle
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [timer, setTimer] = useState(120);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setTimer(120);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError(''); setMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage('A new OTP has been sent to your email.');
      setTimer(120);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setIsLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      
      {/* BACKGROUND IMAGE OVERLAY */}
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
        {/* FROSTED GLASS PANEL */}
        <div className="bg-white/85 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 relative overflow-hidden shadow-2xl shadow-black/40 border border-white/50">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center mb-5 shrink-0 shadow-sm backdrop-blur-md"
            >
              <Lock className="text-indigo-700" size={32} strokeWidth={2.5} />
            </motion.div>
            <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight mb-2">Account Recovery</h2>
            <p className="text-slate-600 text-center text-sm font-medium">
              {step === 1 && "Enter your email to receive a reset code."}
              {step === 2 && "We sent a 6-digit code to your email."}
              {step === 3 && "Create a new, strong password."}
            </p>
          </div>
          
          {/* Notifications */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
                <div className="bg-rose-50/90 backdrop-blur-sm text-rose-700 p-3.5 rounded-xl border border-rose-200 flex items-start gap-3 text-sm font-bold shadow-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
            {message && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
                <div className="bg-emerald-50/90 backdrop-blur-sm text-emerald-700 p-3.5 rounded-xl border border-emerald-200 flex items-start gap-3 text-sm font-bold shadow-sm">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  <span>{message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-500" />
                    </div>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={isLoading}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 sm:text-sm transition-all text-slate-900 bg-white/60 backdrop-blur-sm font-medium placeholder-slate-400"
                    />
                  </div>
                </div>
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} 
                  className="w-full py-3.5 mt-2 rounded-xl flex items-center justify-center gap-2 text-white font-bold transition-all shadow-lg bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/30 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Send Reset Code <ArrowRight size={18} /></>}
                </motion.button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">6-Digit OTP</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-slate-500" />
                    </div>
                    <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" disabled={isLoading}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 sm:text-sm transition-all text-slate-900 bg-white/60 backdrop-blur-sm font-bold tracking-widest placeholder-slate-400"
                    />
                  </div>
                </div>
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} 
                  className="w-full py-3.5 mt-2 rounded-xl flex items-center justify-center gap-2 text-white font-bold transition-all shadow-lg bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/30 disabled:opacity-70">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Verify Code <CheckCircle2 size={18} /></>}
                </motion.button>
                
                <div className="flex flex-col items-center gap-2 mt-4">
                  {timer > 0 ? (
                    <p className="text-sm text-slate-600 font-medium">
                      Resend code in <span className="font-bold text-indigo-700">{formatTime(timer)}</span>
                    </p>
                  ) : (
                    <button type="button" onClick={handleResendOTP} className="text-sm text-indigo-700 hover:text-indigo-800 font-bold flex items-center gap-1 transition-colors drop-shadow-sm">
                      <RefreshCw size={14} /> Resend OTP Now
                    </button>
                  )}
                  <button type="button" onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-slate-800 font-bold transition-colors mt-2">
                    Wrong email? Go back
                  </button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500" />
                    </div>
                    <input type={showPassword ? "text" : "password"} required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" disabled={isLoading}
                      className="block w-full pl-10 pr-10 py-3 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 sm:text-sm transition-all text-slate-900 bg-white/60 backdrop-blur-sm font-medium placeholder-slate-400"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-indigo-600 focus:outline-none transition-colors disabled:opacity-50">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} 
                  className="w-full py-3.5 mt-2 rounded-xl flex items-center justify-center gap-2 text-white font-bold transition-all shadow-lg bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/30 disabled:opacity-70">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Reset Password <CheckCircle2 size={18} /></>}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-300/50 text-center">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-700 flex items-center justify-center gap-1.5 transition-colors">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;