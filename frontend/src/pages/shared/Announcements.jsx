import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Send, CalendarIcon, PlusCircle } from 'lucide-react';
import AnimatedCard from '../../components/AnimatedCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Failed to fetch announcements", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
       const res = await api.post('/announcements', { title, message });
       // Add to top of list
       setAnnouncements([res.data, ...announcements]);
       setTitle('');
       setMessage('');
       setIsFormVisible(false);
    } catch (error) {
       console.error("Failed to create announcement", error);
    } finally {
       setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-800 tracking-tight mb-2">
            Announcements Central
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl">
            Create and manage system-wide announcements. Messages will be broadcasted to all corresponding user dashboards.
          </p>
        </div>
        
        <button 
          onClick={() => setIsFormVisible(!isFormVisible)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-sm transition-all duration-200 ${
             isFormVisible 
               ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
               : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5'
          }`}
        >
          {isFormVisible ? 'Cancel' : <><PlusCircle size={18} /> New Announcement</>}
        </button>
      </div>

      {/* Creation Form */}
      {isFormVisible && (
         <AnimatedCard className="p-1 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white shadow-md">
           <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                    <Megaphone size={20} />
                 </div>
                 <h2 className="text-xl font-display font-semibold text-slate-800">Broadcast Message</h2>
              </div>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
                    <input 
                       type="text" 
                       value={title}
                       onChange={(e) => setTitle(e.target.value)}
                       placeholder="e.g., Library closed this Friday for maintenance"
                       className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 placeholder:font-normal"
                       maxLength={100}
                       required
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                    <textarea 
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       placeholder="Write the detailed announcement here..."
                       rows={4}
                       className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 placeholder:font-normal resize-y"
                       required
                    ></textarea>
                 </div>
              </div>

              <div className="mt-6 flex justify-end">
                 <button 
                    type="submit" 
                    disabled={isSubmitting || !title || !message}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {isSubmitting ? 'Sending...' : <><Send size={16} /> Broadcast Now</>}
                 </button>
              </div>
           </form>
         </AnimatedCard>
      )}

      {/* List of Announcements */}
      <div>
         <h3 className="text-xl font-display font-semibold text-slate-800 mb-6 flex items-center gap-2">
            Recent Announcements
         </h3>
         
         {isLoading ? (
           <div className="space-y-4">
             {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
             ))}
           </div>
         ) : announcements.length === 0 ? (
           <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 bg-slate-50 rounded-[2rem]">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4">
                 <Megaphone size={24} />
              </div>
              <h3 className="text-lg font-display font-semibold text-slate-700">No Announcements Yet</h3>
              <p className="text-slate-500 text-sm mt-1">Create one above to broadcast across the system.</p>
           </div>
         ) : (
           <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
             {announcements.map((announcement) => (
               <AnimatedCard key={announcement._id} variants={itemVariants} className="p-6 border-slate-200 shadow-sm hover:border-indigo-200 transition-all flex flex-col md:flex-row gap-6">
                  
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wide
                           ${announcement.authorRole === 'Admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-sky-50 text-sky-700 border border-sky-100'}
                        `}>
                           {announcement.authorRole}
                        </span>
                        <h4 className="font-display font-bold text-lg text-slate-900 leading-tight">
                           {announcement.title}
                        </h4>
                     </div>
                     <p className="text-slate-600 leading-relaxed font-medium">
                        {announcement.message}
                     </p>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end justify-between shrink-0 pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0">
                     <div className="text-sm font-semibold text-slate-800">
                        {announcement.authorName}
                     </div>
                     <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-1 md:mt-0">
                        <CalendarIcon size={14} />
                        {formatDate(announcement.createdAt)}
                     </div>
                  </div>

               </AnimatedCard>
             ))}
           </motion.div>
         )}
      </div>

    </div>
  );
};

export default Announcements;
