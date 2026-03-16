import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import AnimatedCard from '../../components/AnimatedCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const IssuedBooks = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await api.get('/issues');
        setIssues(response.data);
      } catch (error) {
        console.error("Failed to fetch issued books", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'issued':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock size={12} /> Issued
          </span>
        );
      case 'returned':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> Returned
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-800 tracking-tight mb-2">
            Issued Books History
          </h1>
          <p className="text-slate-500 font-medium">
            View complete details of all books issued to {user?.role === 'Student' || user?.role === 'Professor' ? 'you' : 'users'}.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
             <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 bg-slate-50 rounded-[2rem]">
           <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-6">
              <BookOpen size={40} strokeWidth={1.5} />
           </div>
           <h3 className="text-2xl font-display font-bold text-slate-800 mb-2">No Books Issued</h3>
           <p className="text-slate-500 max-w-md mx-auto">
             There are currently no records of issued books. 
             {user?.role === 'Student' || user?.role === 'Professor' 
                ? ' Head over to the catalog to find your next great read!' 
                : ' As users borrow books, they will appear here.'}
           </p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {issues.map((issue) => (
            <AnimatedCard
              key={issue._id}
              className="p-0 border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-lg hover:border-indigo-200 transition-all duration-300"
              variants={itemVariants}
            >
              {/* Card Header (Book Info) */}
              <div className="p-6 flex gap-6 items-start border-b border-slate-100 bg-white">
                 <div className="w-24 h-36 shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group">
                    <img 
                      src={issue.book.coverImage} 
                      alt={issue.book.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                 </div>
                 <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start mb-2 gap-2">
                       <h3 className="font-display font-bold text-lg text-slate-900 leading-tight truncate-multiline">
                          {issue.book.title}
                       </h3>
                    </div>
                    <p className="text-slate-500 font-medium text-sm mb-4">
                       by {issue.book.author}
                    </p>
                    
                    {getStatusBadge(issue.status)}
                    
                    {(user?.role === 'Librarian' || user?.role === 'Admin') && (
                       <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex flex-col gap-1 text-slate-500">
                          <div>
                             Issued to: <span className="font-semibold text-slate-700">{issue.user.name}</span>
                             <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase font-bold">{issue.user.role}</span>
                          </div>
                          {(issue.user.role === 'Student' || issue.user.role === 'Professor') && (
                             <div className="flex gap-2 text-[10px] font-medium mt-0.5">
                                {issue.user.role === 'Student' && issue.user.rollNo && (
                                   <span className="text-slate-600 bg-slate-50 px-1 py-0.5 rounded border border-slate-100">Roll No: {issue.user.rollNo}</span>
                                )}
                                {issue.user.department && (
                                   <span className="text-slate-600 bg-slate-50 px-1 py-0.5 rounded border border-slate-100">Dept: {issue.user.department}</span>
                                )}
                             </div>
                          )}
                       </div>
                    )}
                 </div>
              </div>

              {/* Card Body (Dates & Details) */}
              <div className="p-6 bg-slate-50/50 flex-1 flex flex-col justify-between">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                       <div className="flex items-center gap-2 text-slate-500">
                          <Calendar size={16} className="text-slate-400" />
                          <span>Issue Date</span>
                       </div>
                       <span className="font-semibold text-slate-800">{formatDate(issue.issueDate)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                       <div className="flex items-center gap-2 text-slate-500">
                          <Clock size={16} className="text-slate-400" />
                          <span>Due Date</span>
                       </div>
                       <span className="font-semibold text-slate-800">{formatDate(issue.dueDate)}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                       <div className="flex items-center gap-2 text-slate-500">
                          <CheckCircle2 size={16} className="text-slate-400" />
                          <span>Return Date</span>
                       </div>
                       <span className={`font-semibold ${!issue.returnDate ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                          {issue.returnDate ? formatDate(issue.returnDate) : 'Not Returned'}
                       </span>
                    </div>
                 </div>

                 {/* Fine Amount Display (if applicable) */}
                 {issue.fineAmount > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                       <div className="flex items-center gap-2 text-rose-600">
                          <AlertCircle size={18} />
                          <span className="text-sm font-semibold">Fine Applied</span>
                       </div>
                       <span className="font-display font-bold text-lg text-rose-600">
                          ₹{issue.fineAmount}
                       </span>
                    </div>
                 )}
              </div>
            </AnimatedCard>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default IssuedBooks;
