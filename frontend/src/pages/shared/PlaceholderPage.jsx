import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const PlaceholderPage = () => {
  const location = useLocation();
  const pathName = location.pathname.split('/').pop().replace(/-/g, ' ');
  const title = pathName.charAt(0).toUpperCase() + pathName.slice(1);

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] w-full">
       <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="glass-panel p-12 rounded-[2rem] flex flex-col items-center text-center max-w-md w-full relative overflow-hidden"
       >
         {/* Subtle corner glow */}
         <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full pointer-events-none"></div>
         <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-500/10 blur-[40px] rounded-full pointer-events-none"></div>

         <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 relative z-10">
            <Construction className="text-indigo-500" size={40} strokeWidth={1.5} />
         </div>
         <h2 className="text-3xl font-display font-bold text-slate-800 mb-3 tracking-tight relative z-10">
            {title}
         </h2>
         <p className="text-slate-500 leading-relaxed font-medium relative z-10">
            This module is currently under active development. Please check back later for updates.
         </p>
       </motion.div>
    </div>
  );
};

export default PlaceholderPage;
