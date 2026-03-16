import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, User, CalendarIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import AnimatedCard from '../../components/AnimatedCard';
import api from '../../services/api';

const BookRequests = () => {
  const [requests, setRequests] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'custom'

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const [catRes, cusRes] = await Promise.all([
          api.get('/requests'),
          api.get('/requests/custom')
      ]);
      setRequests(catRes.data);
      setCustomRequests(cusRes.data);
    } catch (error) {
      console.error("Failed to fetch book requests", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id, action, isCustom) => {
     setProcessingId(id);
     try {
        const endpoint = isCustom ? `/requests/custom/${id}/${action}` : `/requests/${id}/${action}`;
        await api.put(endpoint);
        
        if (isCustom) {
           setCustomRequests(customRequests.filter(r => r._id !== id));
        } else {
           setRequests(requests.filter(r => r._id !== id));
        }
     } catch (error) {
        alert(error.response?.data?.message || `Failed to ${action} request.`);
     } finally {
        setProcessingId(null);
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
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-800 tracking-tight mb-2">
            Pending Book Requests
          </h1>
          <p className="text-slate-500 font-medium">
            Review and approve book requests from students and professors.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 font-display">
         <button 
            onClick={() => setActiveTab('catalog')}
            className={`px-8 py-4 font-semibold text-sm transition-colors border-b-2 tracking-wide ${activeTab === 'catalog' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
         >
            Catalog Requests <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">{requests.length}</span>
         </button>
         <button 
            onClick={() => setActiveTab('custom')}
            className={`px-8 py-4 font-semibold text-sm transition-colors border-b-2 tracking-wide ${activeTab === 'custom' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
         >
            Custom Book Requests <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">{customRequests.length}</span>
         </button>
      </div>

      {isLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
           ))}
         </div>
      ) : (activeTab === 'catalog' ? requests : customRequests).length === 0 ? (
         <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-slate-200 bg-slate-50 rounded-[2rem] mt-8">
            <div className="w-20 h-20 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center mb-6">
               <AlertCircle size={32} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-display font-semibold text-slate-800 mb-2">No Pending Requests</h3>
            <p className="text-slate-500 max-w-md">There are currently no book requests waiting for approval. Check back later.</p>
         </div>
      ) : (
         <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <AnimatePresence mode="popLayout">
             {(activeTab === 'catalog' ? requests : customRequests).map((req) => (
               <AnimatedCard 
                  key={`${activeTab}-${req._id}`} 
                  variants={itemVariants}
                  exit="exit"
                  className="p-0 border-slate-200 shadow-sm hover:border-indigo-200 transition-all overflow-hidden flex flex-col"
               >
                  <div className="p-6 flex-1 flex gap-5">
                     <div className="w-20 rounded-lg overflow-hidden shrink-0 border border-slate-200 shadow-sm aspect-[2/3]">
                        <img src={req.book.coverImage} alt={req.book.title} className="w-full h-full object-cover" />
                     </div>
                     
                     <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                           <h3 className="font-display font-bold text-lg text-slate-900 leading-tight truncate">
                              {req.book.title}
                           </h3>
                           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
                              #{req._id}
                           </span>
                        </div>
                        <p className="text-slate-600 text-sm font-medium mb-4">{req.book.author} {req.book.edition ? `(${req.book.edition})` : ''}</p>
                        
                        <div className="space-y-2 mt-auto">
                           <div className="flex flex-col gap-1 text-sm text-slate-700">
                              <div className="flex items-center gap-2">
                                 <User size={14} className="text-indigo-400" />
                                 <span className="font-semibold">{req.user.name}</span>
                                 <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold uppercase">{req.user.role}</span>
                              </div>
                              {(req.user.role === 'Student' || req.user.role === 'Professor') && (
                                 <div className="flex items-center gap-2 text-xs text-slate-500 ml-5">
                                    {req.user.role === 'Student' && req.user.rollNo && (
                                       <span className="border border-slate-200 px-1.5 py-0.5 rounded bg-white font-medium">Roll No: {req.user.rollNo}</span>
                                    )}
                                    {req.user.department && (
                                       <span className="border border-slate-200 px-1.5 py-0.5 rounded bg-white font-medium">Dept: {req.user.department}</span>
                                    )}
                                 </div>
                              )}
                           </div>
                           <div className="flex items-center gap-2 text-sm text-slate-500">
                              <CalendarIcon size={14} className="text-slate-400" />
                              Requested {formatDate(req.requestDate)}
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex border-t border-slate-100 bg-slate-50">
                     <button 
                        onClick={() => handleAction(req._id, 'reject', req.isCustom)}
                        disabled={processingId === req._id}
                        className="flex-1 py-3 flex items-center justify-center gap-2 text-rose-600 font-semibold hover:bg-rose-50 transition-colors disabled:opacity-50"
                     >
                        <XCircle size={18} />
                        Reject
                     </button>
                     <div className="w-px bg-slate-200"></div>
                     <button 
                        onClick={() => handleAction(req._id, 'approve', req.isCustom)}
                        disabled={processingId === req._id}
                        className="flex-1 py-3 flex items-center justify-center gap-2 text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-50"
                     >
                        <CheckCircle size={18} />
                        {processingId === req._id ? 'Processing...' : (req.isCustom ? 'Approve' : 'Approve & Issue')}
                     </button>
                  </div>
               </AnimatedCard>
             ))}
           </AnimatePresence>
         </motion.div>
      )}
    </div>
  );
};

export default BookRequests;
