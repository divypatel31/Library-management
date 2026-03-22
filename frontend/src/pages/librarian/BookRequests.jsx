import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, BookOpen, BookmarkPlus, User, Hash, Library } from 'lucide-react';
import api from '../../services/api';
import AnimatedCard from '../../components/AnimatedCard';

const BookRequests = () => {
  const [standardRequests, setStandardRequests] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [stdRes, cstRes] = await Promise.all([
        api.get('/requests'),
        api.get('/requests/custom')
      ]);
      setStandardRequests(stdRes.data);
      setCustomRequests(cstRes.data);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleProcess = async (id, action, isCustom) => {
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
    
    setProcessingId(id);
    try {
      // Dynamically hit the correct backend route based on the request type
      const endpoint = isCustom ? `/requests/custom/${id}/${action}` : `/requests/${id}/${action}`;
      await api.put(endpoint);
      
      alert(`Request ${action}d successfully`);
      fetchData(); // Instantly refresh the lists
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing request');
    } finally {
      setProcessingId(null);
    }
  };

  const renderRequestCard = (req, isCustom) => (
    <AnimatedCard key={req._id} className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        
        {/* Left Side: Book & User Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-slate-800 leading-tight">{req.book.title}</h3>
            {isCustom && (
               <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 rounded-lg flex items-center gap-1">
                 <BookmarkPlus size={12} /> New Purchase
               </span>
            )}
          </div>
          
          <p className="text-slate-600 font-medium mb-4 flex items-center gap-2">
             <User size={16} className="text-slate-400" />
             by {req.book.author} {req.book.edition && <span className="text-slate-400">({req.book.edition} Edition)</span>}
          </p>
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
               <span className="text-slate-400 font-medium">Requested by:</span>
               <span className="font-bold text-slate-800">{req.user.name}</span> 
               <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">{req.user.role}</span>
            </div>
            
            {(req.user.rollNo || req.user.department) && (
               <div className="flex items-center gap-4">
                 {req.user.rollNo && <span className="flex items-center gap-1"><Hash size={14} className="text-slate-400"/> {req.user.rollNo}</span>}
                 {req.user.department && <span className="flex items-center gap-1"><Library size={14} className="text-slate-400"/> {req.user.department}</span>}
               </div>
            )}
            
            <p className="flex items-center gap-1.5 pt-1 text-slate-500 font-medium">
               <Clock size={14} /> Submitted on {new Date(req.requestDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}
            </p>
          </div>
        </div>
        
        {/* Right Side: Action Buttons */}
        <div className="flex flex-row md:flex-col gap-3 shrink-0 justify-center md:w-40 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <button 
             onClick={() => handleProcess(req._id, 'approve', isCustom)} 
             disabled={processingId === req._id}
             className="flex-1 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-emerald-100 hover:border-emerald-500 shadow-sm"
          >
            {processingId === req._id ? 'Processing...' : <><CheckCircle2 size={18} /> Approve</>}
          </button>
          
          <button 
             onClick={() => handleProcess(req._id, 'reject', isCustom)} 
             disabled={processingId === req._id}
             className="flex-1 px-4 py-2.5 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-rose-100 hover:border-rose-500 shadow-sm"
          >
            {processingId === req._id ? 'Processing...' : <><XCircle size={18} /> Reject</>}
          </button>
        </div>
        
      </div>
    </AnimatedCard>
  );

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-display font-bold text-slate-800 tracking-tight">Manage Requests</h1>
        <p className="text-slate-500 mt-1">Approve or reject book issues and custom acquisitions.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
           <div className="h-32 bg-slate-100 animate-pulse rounded-2xl border border-slate-200"></div>
           <div className="h-32 bg-slate-100 animate-pulse rounded-2xl border border-slate-200"></div>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* SECTION 1: Standard Requests */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
               <BookOpen size={22} className="text-indigo-600"/> Standard Requests (In Catalog)
            </h2>
            {standardRequests.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-slate-500">
                 <CheckCircle2 size={32} className="mx-auto mb-2 text-slate-400" />
                 <p className="font-medium">No pending standard requests. You're all caught up!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                 <AnimatePresence>
                    {standardRequests.map(req => renderRequestCard(req, false))}
                 </AnimatePresence>
              </div>
            )}
          </section>

          {/* SECTION 2: Custom Requests */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
               <BookmarkPlus size={22} className="text-amber-600"/> Custom Requests (Not in Catalog)
            </h2>
            {customRequests.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-slate-500">
                 <CheckCircle2 size={32} className="mx-auto mb-2 text-slate-400" />
                 <p className="font-medium">No pending custom purchase requests.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                 <AnimatePresence>
                    {customRequests.map(req => renderRequestCard(req, true))}
                 </AnimatePresence>
              </div>
            )}
          </section>
          
        </div>
      )}
    </div>
  );
};

export default BookRequests;