import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Search, Book, Calendar, FileText } from 'lucide-react';
import api from '../../services/api';
import AnimatedCard from '../../components/AnimatedCard';

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        setIsLoading(true);
        // Ensure your backend has this route set up to fetch only the logged-in user's requests
        const res = await api.get('/requests/my-history'); 
        setRequests(res.data);
      } catch (error) {
        console.error('Failed to fetch request history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyRequests();
  }, []);

  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
            <CheckCircle2 size={14} /> Approved
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 shadow-sm">
            <XCircle size={14} /> Rejected
          </div>
        );
      default: // Pending
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 shadow-sm">
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
          <p className="text-slate-500 mt-1">Track the status of the books you have requested.</p>
        </div>
      </div>

      <div className="relative max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search your requests by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
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
          {filteredRequests.map((req, i) => (
            <AnimatedCard key={req._id || i} className="bg-white border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
              
              <div className="flex justify-between items-start mb-4 gap-4 border-b border-slate-100 pb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">{req.title}</h3>
                  <p className="text-sm font-medium text-slate-500">by {req.author}</p>
                </div>
                <div className="shrink-0">
                  {getStatusDisplay(req.status)}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4 flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FileText size={12} /> Reason
                </p>
                <p className="text-slate-700 text-sm italic">"{req.reason}"</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mt-auto pt-3 border-t border-slate-100">
                <Calendar size={14} /> 
                Requested on {new Date(req.created_at || req.request_date || req.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>

            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestHistory;