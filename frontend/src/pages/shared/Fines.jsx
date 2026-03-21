import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Search, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AnimatedCard from '../../components/AnimatedCard';

const Fines = () => {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const isStaff = user?.role === 'Admin' || user?.role === 'Librarian';

  const fetchFines = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/fines');
      setFines(res.data);
    } catch (error) {
      console.error('Failed to fetch fines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handlePayFine = async (fineId) => {
    if (!window.confirm('Mark this fine as paid?')) return;
    
    setProcessingId(fineId);
    try {
      await api.put(`/fines/${fineId}/pay`);
      alert('Fine marked as paid successfully!');
      fetchFines();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredFines = fines.filter(fine => {
    const search = searchTerm.toLowerCase();
    return (
      fine.bookTitle?.toLowerCase().includes(search) ||
      fine.user?.name?.toLowerCase().includes(search) ||
      fine.user?.rollNo?.toLowerCase().includes(search)
    );
  });

  const totalUnpaid = fines
    .filter(f => f.status.toLowerCase() !== 'paid')
    .reduce((sum, f) => sum + Number(f.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800 tracking-tight">
            {isStaff ? 'Manage Fines' : 'My Fines'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isStaff ? 'Track and process student penalty payments.' : 'View and manage your library penalties.'}
          </p>
        </div>
        
        <div className="bg-rose-50 border border-rose-200 px-5 py-3 rounded-xl flex items-center gap-4 shrink-0">
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-rose-600/80">Total Unpaid</p>
            <p className="text-2xl font-bold text-rose-700 leading-none">₹{totalUnpaid}</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder={isStaff ? "Search by student name, roll no, or book..." : "Search by book title..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[...Array(3)].map((_, i) => (
             <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : filteredFines.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 mt-8 text-center border-2 border-dashed border-slate-200 bg-slate-50 rounded-[2rem]">
           <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
              <CheckCircle2 size={40} strokeWidth={1.5} />
           </div>
           <h3 className="text-2xl font-display font-bold text-slate-800 mb-2">All Clear!</h3>
           <p className="text-slate-500 max-w-md mx-auto">
             {searchTerm 
                ? "No fines match your search."
                : isStaff ? "There are no pending fines in the system." : "You have no pending fines. Great job returning your books on time!"}
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {filteredFines.map((fine, i) => {
            const isPaid = fine.status.toLowerCase() === 'paid';
            
            return (
              <AnimatedCard key={fine._id || i} className="bg-white border-slate-200 p-0 flex flex-col h-full hover:shadow-md transition-shadow overflow-hidden">
                
                {/* Header */}
                <div className={`p-5 flex justify-between items-start border-b ${isPaid ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold mb-3 ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {isPaid ? <><CheckCircle2 size={12}/> Paid</> : <><Clock size={12}/> Pending</>}
                    </span>
                    <h3 className="text-3xl font-display font-bold text-slate-800">₹{fine.amount}</h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Book Details</p>
                    <p className="font-medium text-slate-800 leading-tight">{fine.bookTitle || 'Unknown Book'}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Issued: {fine.date ? new Date(fine.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  {isStaff && fine.user && (
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Student Details</p>
                      <p className="font-medium text-slate-800">{fine.user.name}</p>
                      <p className="text-sm text-slate-500">{fine.user.rollNo || fine.user.email}</p>
                    </div>
                  )}
                </div>

                {/* Action Button (Only Staff can mark as paid, and only if it's currently pending) */}
                {isStaff && !isPaid && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <button
                      onClick={() => handlePayFine(fine._id)}
                      disabled={processingId === fine._id}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-70"
                    >
                      {processingId === fine._id ? 'Processing...' : <><CreditCard size={16} /> Mark as Paid</>}
                    </button>
                  </div>
                )}
              </AnimatedCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Fines;