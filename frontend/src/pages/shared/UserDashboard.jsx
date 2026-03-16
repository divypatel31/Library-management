import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, AlertCircle, History, ArrowRight, Bell, CalendarIcon, Megaphone } from 'lucide-react';
import AnimatedCard from '../../components/AnimatedCard';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalIssued: 0,
    pendingFinesCount: 0
  });
  
  const [recentIssues, setRecentIssues] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data);

        // Fetch recent issues
        const issuesRes = await api.get('/issues');
        // Get just top 3 recent issues
        setRecentIssues(issuesRes.data.slice(0, 3));

        // Fetch recent announcements
        const announceRes = await api.get('/announcements');
        setRecentAnnouncements(announceRes.data.slice(0, 2));
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, type: 'spring', stiffness: 300, damping: 24 }
    })
  };

  const statCards = [
    { title: 'Books Currently Issued', value: stats.totalIssued, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
    { title: 'Pending Fines', value: '₹' + stats.pendingFinesCount, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
    { title: 'Total Reading History', value: stats.totalIssued * 3, icon: History, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-800 tracking-tight mb-2">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-slate-500 font-medium">
            Access your reading materials and account status
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
             <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, i) => (
            <AnimatedCard
              key={i}
              className="p-0 border-slate-200"
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <div className="p-6">
                 <div className="flex justify-between items-start mb-4">
                   <div className={`p-3 rounded-xl border shadow-sm ${stat.bg} ${stat.color}`}>
                     <stat.icon size={24} strokeWidth={2} />
                   </div>
                 </div>
                 
                 <div>
                   <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.title}</h3>
                   <div className="text-4xl font-display font-bold text-slate-800">
                     {stat.value.toLocaleString()}
                   </div>
                 </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Section */}
        <div className="lg:col-span-2 space-y-4">
           <h3 className="text-xl font-display font-semibold text-slate-800 pt-4 border-t border-slate-200">Recent Issued Books</h3>
           <div className="grid grid-cols-1 gap-4">
              {recentIssues.length > 0 ? recentIssues.map((issue) => (
            <div key={issue._id} className="p-4 rounded-2xl bg-white shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-6 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
               <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden border border-slate-100">
                  <img src={issue.book.coverImage} alt={issue.book.title} className="w-full h-full object-cover" />
               </div>
               <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-bold text-slate-800 mb-1">{issue.book.title}</h4>
                  <p className="text-sm text-slate-500 font-medium">{issue.book.author}</p>
               </div>
               <div className="flex flex-col gap-2 shrink-0 min-w-[150px] text-center sm:text-right">
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold border inline-block self-center sm:self-end
                     ${issue.status.toLowerCase() === 'issued' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}
                  `}>
                     {issue.status}
                  </span>
                  <div className="text-xs text-slate-400 font-medium">
                     Due: {new Date(issue.dueDate).toLocaleDateString()}
                  </div>
               </div>
            </div>
         )) : (
            <div className="p-8 text-center border border-dashed border-slate-300 rounded-2xl text-slate-500 bg-slate-50/50">
               No recent books issued. Visit the catalog to explore!
            </div>
         )}
         </div>
      </div>

      {/* Announcements Widget */}
      <div className="space-y-4">
         <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <h3 className="text-xl font-display font-semibold text-slate-800 flex items-center gap-2">
               <Bell size={20} className="text-indigo-600" />
               Latest Updates
            </h3>
            <Link to={`/${user?.role.toLowerCase()}/notifications`} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
               View All <ArrowRight size={14} />
            </Link>
         </div>

         <div className="flex flex-col gap-4">
            {recentAnnouncements.length > 0 ? recentAnnouncements.map((ann) => (
               <div key={ann._id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
                  <div className="flex items-center gap-2 mb-2">
                     <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ann.authorRole === 'Admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-sky-50 text-sky-600'}`}>
                        {ann.authorRole}
                     </span>
                     <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <CalendarIcon size={12} /> {formatDate(ann.createdAt)}
                     </span>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1 leading-tight group-hover:text-indigo-600 transition-colors">{ann.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-2">{ann.message}</p>
               </div>
            )) : (
               <div className="p-6 text-center border border-dashed border-slate-300 rounded-2xl text-slate-500 bg-slate-50/50 text-sm">
                  No new announcements right now.
               </div>
            )}
         </div>
      </div>
      
      </div>
    </div>
  );
};

export default UserDashboard;
