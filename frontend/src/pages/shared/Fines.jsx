import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, IndianRupee, Clock, BookOpen, User, CheckCircle2 } from 'lucide-react';
import AnimatedCard from '../../components/AnimatedCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Fines = () => {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFines = async () => {
      try {
        const response = await api.get('/issues');
        // Filter out issues that don't have pending fines
        const issuesWithFines = response.data.filter(issue => issue.fineAmount > 0);
        setFines(issuesWithFines);
      } catch (error) {
        console.error("Failed to fetch fines", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFines();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDelay = (dueDate, returnDate) => {
    const due = new Date(dueDate);
    const returned = returnDate ? new Date(returnDate) : new Date();
    
    if (returned <= due) return 0;
    
    const diffTime = Math.abs(returned - due);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const totalFines = fines.reduce((sum, issue) => sum + Number(issue.fineAmount), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-800 tracking-tight mb-2">
            Pending Fines
          </h1>
          <p className="text-slate-500 font-medium">
            {user?.role === 'Student' || user?.role === 'Professor' 
              ? 'View and manage your outstanding library fines.' 
              : 'Overview of all pending fines across the system.'}
          </p>
        </div>
        
        {fines.length > 0 && (
          <div className="bg-rose-50 border border-rose-100 px-6 py-3 rounded-2xl flex items-center gap-4 shrink-0">
             <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
               <AlertCircle size={24} />
             </div>
             <div>
                <div className="text-sm font-semibold text-rose-600 mb-0.5">Total Pending Amount</div>
                <div className="text-2xl font-display font-bold text-rose-700 leading-none">
                  ₹{totalFines}
                </div>
             </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
             <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : fines.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 bg-slate-50 rounded-[2rem]">
           <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
              <CheckCircle2 size={40} strokeWidth={1.5} />
           </div>
           <h3 className="text-2xl font-display font-bold text-slate-800 mb-2">You're All Clear!</h3>
           <p className="text-slate-500 max-w-md mx-auto">
             {user?.role === 'Student' || user?.role === 'Professor' 
                ? 'Great job! You have no pending fines. Keep returning your books on time.' 
                : 'There are currently no outstanding fines in the system.'}
           </p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {fines.map((issue) => {
            const daysDelayed = calculateDelay(issue.dueDate, issue.returnDate);
            
            return (
              <AnimatedCard
                key={issue._id}
                className="p-0 border-slate-200 overflow-hidden flex flex-col sm:flex-row h-full hover:shadow-lg hover:border-rose-200 transition-all duration-300"
                variants={itemVariants}
              >
                {/* Left Side: Amount Display */}
                <div className="bg-rose-50 p-6 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-rose-100 sm:w-48 shrink-0">
                   <div className="text-rose-400 font-medium text-sm mb-2 text-center uppercase tracking-wider">Fine Amount</div>
                   <div className="flex items-center text-rose-600 font-display font-bold text-4xl mb-4">
                      <IndianRupee size={28} className="mt-1" strokeWidth={3} />
                      {issue.fineAmount}
                   </div>
                   
                   <div className="bg-white rounded-xl px-4 py-2 border border-rose-100 shadow-sm flex items-center gap-2 text-rose-700 text-sm font-semibold w-full justify-center">
                     <Clock size={16} />
                     {daysDelayed} {daysDelayed === 1 ? 'Day' : 'Days'} Late
                   </div>
                </div>

                {/* Right Side: Details */}
                <div className="p-6 bg-white flex-1 flex flex-col justify-center">
                   
                   {/* Book Details */}
                   <div className="flex items-start gap-4 mb-6">
                     <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                       <BookOpen size={20} />
                     </div>
                     <div>
                       <h3 className="font-display font-bold text-slate-800 text-lg leading-tight mb-1">
                          {issue.book.title}
                       </h3>
                       <p className="text-slate-500 text-sm font-medium">by {issue.book.author}</p>
                     </div>
                   </div>

                   {/* User Details (For Admins/Librarians only) */}
                   {(user?.role === 'Admin' || user?.role === 'Librarian') && (
                     <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                         {issue.user.name.charAt(0)}
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="font-semibold text-slate-800 text-sm truncate">{issue.user.name}</div>
                         <div className="text-xs text-slate-500 truncate">{issue.user.email}</div>
                       </div>
                       <div className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-600">
                         {issue.user.role}
                       </div>
                     </div>
                   )}

                   {/* Date Tracking */}
                   <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-slate-100">
                     <div>
                       <div className="text-xs text-slate-400 font-medium mb-1">Due Date</div>
                       <div className="font-semibold text-slate-800 text-sm">{formatDate(issue.dueDate)}</div>
                     </div>
                     <div>
                       <div className="text-xs text-slate-400 font-medium mb-1">Status</div>
                       <div className={`font-semibold text-sm ${issue.status.toLowerCase() === 'returned' ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {issue.status}
                       </div>
                     </div>
                   </div>
                </div>
              </AnimatedCard>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default Fines;
