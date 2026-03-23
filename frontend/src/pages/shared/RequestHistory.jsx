import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Search, Book, Calendar, FileText, Trash2 } from 'lucide-react';
import api from '../../services/api';
import AnimatedCard from '../../components/AnimatedCard';

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch History from Backend
  const fetchMyRequests = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/requests/my-history'); 
      setRequests(res.data);
    } catch (error) {
      console.error('Failed to fetch request history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchMyRequests(); 
  }, []);

  // 2. Handle Delete Functionality
  const handleDelete = async (id, type, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from your history?`)) return;
    try {
      // Backend route: router.delete('/my-history/:type/:id', protect, deleteMyRequest)
      await api.delete(`/requests/my-history/${type}/${id}`);
      fetchMyRequests(); // Refresh list after deletion
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete record');
    }
  };

  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 size={14} /> Approved
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
            <XCircle size={14} /> Rejected
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
            <Clock size={14} /> Pending
          </div>
        );
    }
  };

  const filteredRequests = requests.filter(req => 
    req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800 tracking-tight">
            My Request History
          </h1>
          <p className="text-slate-500 mt-1">Track and manage your submitted book requests.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search your requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 mt-8 text-center border-2 border-dashed border-slate-200 bg-slate-50 rounded-[2rem]">
           <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-6">
              <Book size={40} strokeWidth={1.5} />
           </div>
           <h3 className="text-2xl font-display font-bold text-slate-800 mb-2">No Requests Found</h3>
           <p className="text-slate-500 max-w-md mx-auto">
             {searchTerm 
                ? "None of your requests match that search."
                : "You haven't submitted any book requests yet."}
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          <AnimatePresence>
            {filteredRequests.map((req) => (
              <AnimatedCard 
                key={`${req.type}-${req._id}`} 
                className="bg-white border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-all shadow-sm"
              >
                
                {/* Header: Title, Author, Status */}
                <div className="flex justify-between items-start mb-4 gap-4 pb-4 border-b border-slate-100">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">{req.title}</h3>
                    <p className="text-sm font-medium text-slate-500">by {req.author}</p>
                  </div>
                  <div className="shrink-0">
                    {getStatusDisplay(req.status)}
                  </div>
                </div>

                {/* Body: Reason Box */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-5 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <FileText size={12} /> Reason for Request
                  </p>
                  <p className="text-slate-700 text-sm italic">"{req.reason || 'No reason provided.'}"</p>
                </div>

                {/* Footer: Date & Action Buttons */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Calendar size={14} className="text-slate-400" /> 
                    {new Date(req.request_date || req.createdAt).toLocaleDateString(undefined, {
                       year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </div>
                  
                  {/* Delete Button (Only visible if status is NOT pending) */}
                  {req.status !== 'pending' && (
                    <button 
                      onClick={() => handleDelete(req._id, req.type || 'standard', req.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
                      title="Remove from history"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>

              </AnimatedCard>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default RequestHistory;