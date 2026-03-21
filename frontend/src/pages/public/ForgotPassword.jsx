import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, Lock, ArrowRight, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import Input from '../../components/Input';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // NEW: Timer State (120 seconds = 2 minutes)
  const [timer, setTimer] = useState(120);
  const navigate = useNavigate();

  // NEW: Countdown Effect
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // NEW: Format seconds into MM:SS
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
      setTimer(120); // Start the 2-minute timer
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Resend OTP Logic
  const handleResendOTP = async () => {
    setError(''); setMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage('A new OTP has been sent to your email.');
      setTimer(120); // Reset the timer back to 2 minutes
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
            <Lock size={24} />
          </Link>
          <h1 className="text-3xl font-display font-bold text-slate-800 tracking-tight">
            Account Recovery
          </h1>
          <p className="text-slate-500 mt-2">
            {step === 1 && "Enter your email to receive a reset code."}
            {step === 2 && "We sent a 6-digit code to your email."}
            {step === 3 && "Create a new, strong password."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 overflow-hidden">
          
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium border border-emerald-100 flex items-center gap-2">
              <CheckCircle2 size={16} />
              {message}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleSendOTP} className="space-y-5">
                <Input label="Email Address" type="email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2">
                  {isLoading ? 'Sending...' : <>Send Reset Code <ArrowRight size={18} /></>}
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleVerifyOTP} className="space-y-5">
                <Input label="6-Digit OTP" type="text" icon={KeyRound} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} required />
                <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2">
                  {isLoading ? 'Verifying...' : <>Verify Code <ArrowRight size={18} /></>}
                </button>
                
                {/* NEW: Resend OTP UI */}
                <div className="flex flex-col items-center gap-2 mt-4">
                  {timer > 0 ? (
                    <p className="text-sm text-slate-500">
                      Resend code in <span className="font-semibold text-indigo-600">{formatTime(timer)}</span>
                    </p>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleResendOTP}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw size={14} /> Resend OTP Now
                    </button>
                  )}
                  
                  <button type="button" onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors mt-2">
                    Wrong email? Go back
                  </button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleResetPassword} className="space-y-5">
                <Input label="New Password" type="password" icon={Lock} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" minLength={6} required />
                <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2">
                  {isLoading ? 'Updating...' : <>Reset Password <CheckCircle2 size={18} /></>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-1 transition-colors">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;