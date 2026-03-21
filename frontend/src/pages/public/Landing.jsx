import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Shield, Zap, ArrowRight, Library, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  return (
    <div className="min-h-screen relative overflow-hidden bg-white selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Dynamic Premium Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-3xl animate-blob"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-sky-200/40 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[0%] left-[20%] w-[60%] h-[40%] rounded-full bg-purple-100/40 blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40"></div>
      </div>

      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/60 backdrop-blur-md border border-white shadow-sm">
             <Library className="text-indigo-600 relative z-10" size={24} />
          </div>
          <span className="text-2xl font-display font-bold text-slate-800 tracking-tight">
            Welcome to Liborbit<span className="text-indigo-600"></span>
          </span>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-full glass-panel text-slate-700 font-semibold flex items-center gap-2 hover:bg-white/80 transition-all cursor-pointer"
        >
          Access Portal
          <ArrowRight size={16} className="text-slate-400" />
        </motion.button>
      </nav>

      <main className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-8"
          >
            <div className="inline-block relative self-start">
               <span className="relative z-10 px-4 py-1.5 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-sm font-semibold tracking-wide flex items-center gap-2">
                 <CheckCircle2 size={14} className="text-sky-500" />
                 Enterprise Library System
               </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight text-slate-900 tracking-tight">
              Manage Knowledge with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">
                absolute precision.
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              Step into the future of campus library management. A seamlessly integrated, professional portal designed for administrators, librarians, students, and professors.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               <motion.button
                  whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all cursor-pointer"
               >
                  Initiate Session
                  <ArrowRight size={20} className="text-indigo-200" />
               </motion.button>
            </div>
          </motion.div>

          {/* Clean Light-Themed Showcase Area */}
          <div className="relative h-[500px] w-full hidden lg:flex flex-col items-center justify-center perspective-[1000px] pointer-events-none">
             
             {/* Subtle Center Glow */}
             <div className="absolute inset-0 bg-sky-100/50 blur-[80px] rounded-full"></div>
             
             {/* Rotating Rings */}
             <motion.div 
               animate={{ rotateX: 360, rotateY: 360 }}
               transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
               className="absolute w-[400px] h-[400px] border border-slate-200 rounded-full border-t-indigo-400 border-l-sky-300"
             />
             <motion.div 
               animate={{ rotateX: -360, rotateY: 180 }}
               transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
               className="absolute w-[300px] h-[300px] border border-slate-100 rounded-full border-b-sky-400 border-r-indigo-300"
             />

             {/* Floating Books */}
             {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -20, 0],
                    rotateY: [0, 5, -5, 0],
                    rotateX: [0, 2, -2, 0]
                  }}
                  transition={{ 
                    duration: 5 + i, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: i * 0.3
                  }}
                  className={`absolute glass p-3 rounded-xl flex flex-col items-center justify-center 
                     ${i === 0 ? '-left-10 top-20 w-40 h-56 z-20' : ''}
                     ${i === 1 ? 'right-0 top-10 w-48 h-64 z-10' : ''}
                     ${i === 2 ? 'left-1/4 bottom-10 w-36 h-48 z-30' : ''}
                  `}
                >
                  <div className={`w-full h-full rounded-md border border-white/40 flex items-center justify-center relative overflow-hidden bg-white/40`}>
                     <BookOpen className="text-slate-300 w-1/2 h-1/2" />
                  </div>
                </motion.div>
             ))}
          </div>

        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 relative z-10">
          {[
            {
              icon: LayoutGrid,
              title: "Digital Catalog",
              desc: "Instant search and availability tracking of thousands of resources.",
              color: "text-sky-600",
              bg: "bg-sky-50",
              border: "border-sky-100"
            },
            {
              icon: Shield,
              title: "Role-Based Access",
              desc: "Secure portals tuned specifically for admins, librarians, and students.",
              color: "text-indigo-600",
              bg: "bg-indigo-50",
              border: "border-indigo-100"
            },
            {
              icon: Zap,
              title: "Automated Fines",
              desc: "Smart due-date tracking and automated penalty calculations.",
              color: "text-rose-600",
              bg: "bg-rose-50",
              border: "border-rose-100"
            }
          ].map((feature, idx) => (
             <motion.div
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
               whileHover={{ y: -5 }}
               className="glass rounded-2xl p-8 transition-all group"
             >
               <div className="relative z-10">
                 <div className={`w-14 h-14 rounded-xl flex items-center justify-center border border-white/60 mb-6 transition-transform group-hover:scale-110 bg-white/50 ${feature.color}`}>
                    <feature.icon size={28} strokeWidth={2} />
                 </div>
                 <h3 className="text-xl font-display font-semibold text-slate-800 mb-3">{feature.title}</h3>
                 <p className="text-slate-500 leading-relaxed text-sm/relaxed">{feature.desc}</p>
               </div>
             </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Landing;
