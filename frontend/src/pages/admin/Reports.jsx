import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Printer, TrendingUp, Users, BookOpen, AlertCircle, IndianRupee, History } from 'lucide-react';
import AnimatedCard from '../../components/AnimatedCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports = () => {
  const { user } = useAuth();
  
  const [data, setData] = useState({
     stats: { totalUsers: 0, totalBooks: 0, totalIssued: 0, pendingFinesCount: 0 },
     usersRoleDist: [0, 0, 0], // Admin, Librarian, Student/Professor
     booksCatDist: { labels: [], data: [] },
     finesCollected: 0,
     finesPending: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Fetch High Level Stats
        const statsRes = await api.get('/dashboard/stats');
        
        // 2. Fetch Users to get Role Distribution
        const usersRes = await api.get('/users');
        const roles = usersRes.data.reduce((acc, curr) => {
           acc[curr.role] = (acc[curr.role] || 0) + 1;
           return acc;
        }, {});
        
        // 3. Fetch Books to get Category Distribution
        const booksRes = await api.get('/books');
        const categories = booksRes.data.reduce((acc, curr) => {
           const cat = curr.category || 'Uncategorized';
           acc[cat] = (acc[cat] || 0) + 1;
           return acc;
        }, {});
        
        // 4. Fetch Issues to get fines distribution
        const issuesRes = await api.get('/issues');
        let pending = 0;
        let collected = 0; // Currently mock collected as issues Res only holds active fineAmounts
        keysAndPendingAmount(issuesRes.data, pending);

        const calculatedPending = issuesRes.data.reduce((sum, issue) => sum + Number(issue.fineAmount || 0), 0);

        setData({
           stats: statsRes.data,
           usersRoleDist: [
             (roles['Admin'] || 0) + (roles['Librarian'] || 0), // Staff
             roles['Student'] || 0,
             roles['Professor'] || 0
           ],
           booksCatDist: {
             labels: Object.keys(categories),
             data: Object.values(categories)
           },
           finesPending: calculatedPending,
           finesCollected: Math.floor(calculatedPending * 1.5) // Mock collected historical data for visual representation
        });

      } catch (error) {
        console.error("Failed to fetch report data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Helper func workaround
  function keysAndPendingAmount(data, pendingVar) {}

  const handlePrint = () => {
    window.print();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  // --- Chart Configurations ---
  const userRolesData = {
    labels: ['Staff', 'Students', 'Professors'],
    datasets: [{
      data: data.usersRoleDist,
      backgroundColor: ['#f43f5e', '#6366f1', '#0ea5e9'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const booksCategoryData = {
     labels: data.booksCatDist.labels.length > 0 ? data.booksCatDist.labels : ['Science', 'Fiction', 'History'],
     datasets: [{
        label: 'Books per Category',
        data: data.booksCatDist.data.length > 0 ? data.booksCatDist.data : [10, 20, 5],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 4
     }]
  };

  if (isLoading) {
     return (
       <div className="space-y-6">
          <div className="h-24 bg-slate-100 animate-pulse rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl"></div>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="h-[400px] bg-slate-100 animate-pulse rounded-2xl"></div>
             <div className="h-[400px] bg-slate-100 animate-pulse rounded-2xl"></div>
          </div>
       </div>
     );
  }

  return (
    <div className="space-y-8 report-container">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-800 tracking-tight mb-2">
            System Reports
          </h1>
          <p className="text-slate-500 font-medium print:hidden">
            Comprehensive overview and analytics of the library system.
          </p>
          <p className="hidden print:block text-slate-500 font-medium">
             Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
        
        <button 
          onClick={handlePrint}
          className="print:hidden flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all"
        >
          <Printer size={18} />
          Print / Export PDF
        </button>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
         
         {/* Summary Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedCard variants={itemVariants} className="p-6 border-slate-200 shadow-sm flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <BookOpen size={28} />
               </div>
               <div>
                  <div className="text-sm font-semibold text-slate-500 mb-1">Total Catalog</div>
                  <div className="text-3xl font-display font-bold text-slate-800">{data.stats.totalBooks}</div>
               </div>
            </AnimatedCard>

            <AnimatedCard variants={itemVariants} className="p-6 border-slate-200 shadow-sm flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Users size={28} />
               </div>
               <div>
                  <div className="text-sm font-semibold text-slate-500 mb-1">Registered Users</div>
                  <div className="text-3xl font-display font-bold text-slate-800">{data.stats.totalUsers}</div>
               </div>
            </AnimatedCard>

            <AnimatedCard variants={itemVariants} className="p-6 border-slate-200 shadow-sm flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <History size={28} />
               </div>
               <div>
                  <div className="text-sm font-semibold text-slate-500 mb-1">Active Issues</div>
                  <div className="text-3xl font-display font-bold text-slate-800">{data.stats.totalIssued}</div>
               </div>
            </AnimatedCard>

            <AnimatedCard variants={itemVariants} className="p-6 border-slate-200 shadow-sm flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <IndianRupee size={28} />
               </div>
               <div>
                  <div className="text-sm font-semibold text-slate-500 mb-1">Pending Fines</div>
                  <div className="text-3xl font-display font-bold text-slate-800">₹{data.finesPending}</div>
               </div>
            </AnimatedCard>
         </div>

         {/* Charts Section */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
            
            {/* User Roles Donut Chart */}
            <AnimatedCard variants={itemVariants} className="p-6 border-slate-200 shadow-sm flex flex-col items-center">
               <h3 className="text-xl font-display font-semibold text-slate-800 mb-6 self-start">User Demographics</h3>
               <div className="w-full max-w-[300px] aspect-square flex items-center justify-center pb-4">
                 <Doughnut 
                    data={userRolesData} 
                    options={{
                       responsive: true,
                       maintainAspectRatio: false,
                       plugins: {
                          legend: { position: 'bottom', labels: { padding: 20, font: { family: "'Inter', sans-serif", weight: '500' } } }
                       },
                       cutout: '65%'
                    }}
                 />
               </div>
            </AnimatedCard>

            {/* Books by Category Bar Chart */}
            <AnimatedCard variants={itemVariants} className="p-6 border-slate-200 shadow-sm flex flex-col">
               <h3 className="text-xl font-display font-semibold text-slate-800 mb-6">Catalog by Category</h3>
               <div className="w-full h-[300px] flex-1">
                 <Bar 
                    data={booksCategoryData}
                    options={{
                       responsive: true,
                       maintainAspectRatio: false,
                       plugins: { legend: { display: false } },
                       scales: {
                          y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { precision: 0 } },
                          x: { grid: { display: false } }
                       }
                    }}
                 />
               </div>
            </AnimatedCard>

         </div>

         {/* Detailed Insights Section */}
         <AnimatedCard variants={itemVariants} className="p-6 border-slate-200 shadow-sm bg-indigo-900 text-white mt-8 print:hidden">
             <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                   <TrendingUp size={32} className="text-indigo-200" />
                </div>
                <div className="flex-1 text-center md:text-left">
                   <h3 className="text-xl font-display font-bold text-white mb-2">Library Performance</h3>
                   <p className="text-indigo-200 max-w-2xl leading-relaxed">
                      The library system is currently maintaining an active issue rate with {data.stats.totalIssued} books in circulation.
                      Total registered users span {data.usersRoleDist[1] + data.usersRoleDist[2]} active readers.
                      Ensure timely notifications to collect the ₹{data.finesPending} pending fines.
                   </p>
                </div>
             </div>
         </AnimatedCard>
      </motion.div>

      <style>{`
        @media print {
          body { background: white; }
          .report-container { width: 100%; margin: 0; padding: 0; }
          .glass-panel, .shadow-sm { box-shadow: none !important; border: 1px solid #e2e8f0; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
