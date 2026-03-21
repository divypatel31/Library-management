import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, AlertCircle, Clock, CheckCircle2, Search, ArrowDownCircle } from 'lucide-react';
import AnimatedCard from '../../components/AnimatedCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const IssuedBooks = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);

  const isStaff = user?.role === 'Admin' || user?.role === 'Librarian';

  const fetchIssues = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/issues');
      setIssues(response.data);
    } catch (error) {
      console.error("Failed to fetch issued books", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleReturnBook = async (issueId) => {
    if (!window.confirm("Are you sure you want to mark this book as returned?")) return;
    
    setReturningId(issueId);
    try {
      const res = await api.put(`/issues/${issueId}/return`);
      if (res.data.fine > 0) {
        alert(`Book returned successfully! \n\n⚠️ NOTE: A late fine of ₹${res.data.fine} has been applied to this user.`);
      } else {
        alert('Book returned successfully!');
      }
      await fetchIssues();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to return book');
    } finally {
      setReturningId(null);
    }
  };

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
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mt-3 inline-flex w-fit">
            <Clock size={12} /> Issued
          </span>
        );
      case 'returned':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-3 inline-flex w-fit">
            <CheckCircle2 size={12} /> Returned
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 mt-3 inline-flex w-fit">
            {status}
          </span>
        );
    }
  };

  const filteredIssues = issues.filter(issue => {
    const search = searchTerm.toLowerCase();
    return (
      issue.book?.title?.toLowerCase().includes(search) ||
      issue.user?.name?.toLowerCase().includes(search) ||
      issue.user?.rollNo?.toLowerCase().includes(search) ||
      issue.user?.email?.toLowerCase().includes(search)
    );
  });

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-800 tracking-tight mb-2">
            Issued Books History
          </h1>
          <p className="text-slate-500 font-medium">
            View complete details of all books issued to {!isStaff ? 'you' : 'users'}.
          </p>
        </div>
      </div>

      <div className="relative max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder={isStaff ? "Search by book title, student name, or roll no..." : "Search by book title..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
          {[...Array(6)].map((_, i) => (
             <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 mt-8 text-center border-2 border-dashed border-slate-200 bg-slate-50 rounded-[2rem]">
           <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-6">
              <BookOpen size={40} strokeWidth={1.5} />
           </div>
           <h3 className="text-2xl font-display font-bold text-slate-800 mb-2">No Records Found</h3>
           <p className="text-slate-500 max-w-md mx-auto">
             {searchTerm 
                ? "No issued books match your current search."
                : "There are currently no records of issued books."}
           </p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4"
        >
          {filteredIssues.map((issue) => (
            <AnimatedCard
              key={issue._id}
              className="p-0 border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-lg hover:border-indigo-200 transition-all duration-300 bg-white"
              variants={itemVariants}
            >
              <div className="p-6 flex gap-6 items-start border-b border-slate-100">
                 <div className="w-24 h-36 shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group bg-slate-100">
                    
                    {/* NEW: Smart Image Logic fetching from Open Library API */}
                    <img 
                      src={issue.book?.isbn ? `https://covers.openlibrary.org/b/isbn/${issue.book.isbn.replace(/[- ]/g, '')}-M.jpg?default=false` : 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300'} 
                      alt={issue.book?.title || 'Book Cover'} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300';
                      }}
                    />

                 </div>
                 <div className="flex-1 min-w-0 pt-1 flex flex-col h-full">
                    <h3 className="font-display font-bold text-lg text-slate-900 leading-tight line-clamp-2 mb-1">
                       {issue.book?.title || 'Unknown Book'}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm">
                       by {issue.book?.author || 'Unknown'}
                    </p>
                    
                    {getStatusBadge(issue.status)}
                    
                    {isStaff && issue.user && (
                       <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex flex-col gap-1.5 text-slate-500">
                          <div className="flex items-center gap-1.5">
                             <span className="shrink-0 text-slate-400">To:</span> 
                             <span className="font-semibold text-slate-700 truncate">{issue.user.name}</span>
                          </div>
                          {(issue.user.role === 'Student' || issue.user.role === 'Professor') && (
                             <div className="flex gap-2 text-[10px] font-medium mt-0.5 flex-wrap">
                                {issue.user.role === 'Student' && issue.user.rollNo && (
                                   <span className="text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{issue.user.rollNo}</span>
                                )}
                                {issue.user.department && (
                                   <span className="text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{issue.user.department}</span>
                                )}
                             </div>
                          )}
                       </div>
                    )}
                 </div>
              </div>

              <div className="p-6 bg-slate-50/50 flex-1 flex flex-col justify-between gap-6">
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
                       <span className={`font-semibold ${new Date(issue.dueDate) < new Date() && issue.status.toLowerCase() === 'issued' ? 'text-rose-600' : 'text-slate-800'}`}>
                          {formatDate(issue.dueDate)}
                       </span>
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

                 <div className="mt-auto space-y-4">
                    {issue.fineAmount > 0 && (
                       <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-rose-600">
                             <AlertCircle size={18} />
                             <span className="text-sm font-semibold">Fine Applied</span>
                          </div>
                          <span className="font-display font-bold text-lg text-rose-600">
                             ₹{issue.fineAmount}
                          </span>
                       </div>
                    )}

                    {isStaff && issue.status.toLowerCase() === 'issued' && (
                       <button
                         onClick={() => handleReturnBook(issue._id)}
                         disabled={returningId === issue._id}
                         className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-70 shadow-sm"
                       >
                         {returningId === issue._id ? (
                           <span className="flex items-center gap-2">Processing...</span>
                         ) : (
                           <><ArrowDownCircle size={16} /> Mark as Returned</>
                         )}
                       </button>
                    )}
                 </div>
              </div>
            </AnimatedCard>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default IssuedBooks;