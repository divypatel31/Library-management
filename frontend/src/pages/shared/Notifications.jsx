import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CalendarIcon, Megaphone } from 'lucide-react';
import AnimatedCard from '../../components/AnimatedCard';
import api from '../../services/api';

const Notifications = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get('/announcements');
        setAnnouncements(response.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const formatDate = (dateString, format = 'full') => {
    const d = new Date(dateString);
    if (format === 'short') {
       return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-end gap-4 pb-4 border-b border-slate-200">
         <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shrink-0 border border-sky-100 shadow-sm">
            <Bell size={24} />
         </div>
         <div>
            <h1 className="text-3xl font-display font-bold text-slate-800 tracking-tight mb-1">
               System Notifications
            </h1>
            <p className="text-slate-500 font-medium">
               Stay updated on library announcements and alerts.
            </p>
         </div>
      </div>

      {isLoading ? (
         <div className="space-y-6 relative pl-4 md:pl-8 before:content-[''] before:absolute before:left-4 md:before:left-8 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100">
           {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse border border-slate-200 ml-6 md:ml-8"></div>
           ))}
         </div>
      ) : announcements.length === 0 ? (
         <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 bg-slate-50 rounded-[2rem] mt-8">
            <div className="w-16 h-16 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4">
               <Bell size={24} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-display font-semibold text-slate-800 mb-1">You're all caught up!</h3>
            <p className="text-slate-500">There are no new announcements from the administration.</p>
         </div>
      ) : (
         <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative pl-4 md:pl-8 before:content-[''] before:absolute before:left-[15.5px] md:before:left-[31.5px] before:top-4 before:bottom-0 before:w-0.5 before:bg-slate-200 before:z-0">
           <div className="space-y-8 relative z-10">
             {announcements.map((item, i) => (
               <motion.div key={item._id} variants={itemVariants} className="relative flex items-start gap-6 md:gap-8 group">
                  
                  {/* Timeline Dot & Date Badge */}
                  <div className="flex flex-col items-center shrink-0">
                     <div className="w-8 h-8 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center shadow-sm group-hover:border-indigo-500 group-hover:scale-110 transition-all duration-300 z-10 -ml-[12px] md:-ml-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 group-hover:bg-indigo-600 transition-colors"></div>
                     </div>
                     <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 rotate-180" style={{ writingMode: 'vertical-rl' }}>
                        {formatDate(item.createdAt, 'short')}
                     </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm group-hover:shadow-md group-hover:border-indigo-200 transition-all duration-300 relative before:content-[''] before:absolute before:-left-2 before:top-3 before:w-4 before:h-4 before:bg-white before:border-l before:border-b before:border-slate-200 before:rotate-45 group-hover:before:border-indigo-200 transition-colors">
                     
                     <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                           <div className={`p-1.5 rounded-lg ${item.authorRole === 'Admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-sky-50 text-sky-600'}`}>
                              <Megaphone size={14} />
                           </div>
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.authorRole} Announcement</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                           <CalendarIcon size={12} />
                           {formatDate(item.createdAt)}
                        </div>
                     </div>

                     <h3 className="text-xl font-display font-bold text-slate-800 mb-2 leading-tight">
                        {item.title}
                     </h3>
                     
                     <p className="text-slate-600 font-medium leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        {item.message}
                     </p>

                     <div className="mt-4 flex justify-end">
                        <span className="text-xs font-semibold text-slate-400">
                           Posted by {item.authorName}
                        </span>
                     </div>
                  </div>

               </motion.div>
             ))}
           </div>
         </motion.div>
      )}
    </div>
  );
};

export default Notifications;
