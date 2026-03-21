import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, AlertCircle, History, TrendingUp, Activity } from 'lucide-react';
import AnimatedCard from '../../components/AnimatedCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalIssued: 0,
    pendingFinesCount: 0,
    pendingRequestsCount: 0
  });
  
  const [chartData, setChartData] = useState({
     labels: [],
     datasets: []
  });

  // NEW: State for real user breakdown
  const [userBreakdown, setUserBreakdown] = useState([0, 0, 0]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats, charts, and users concurrently
        const [statsRes, chartRes, usersRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/chart'),
          api.get('/users')
        ]);

        setStats(statsRes.data);
        setChartData(chartRes.data);

        // Calculate real user breakdown for the Bar chart
        const users = usersRes.data;
        const students = users.filter(u => u.role.toLowerCase() === 'student').length;
        const professors = users.filter(u => u.role.toLowerCase() === 'professor').length;
        const staff = users.filter(u => ['admin', 'librarian'].includes(u.role.toLowerCase())).length;
        
        setUserBreakdown([students, professors, staff]);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
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
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
    { title: 'Total Books in Catalog', value: stats.totalBooks, icon: BookOpen, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
    { title: 'Currently Issued', value: stats.totalIssued, icon: History, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { title: 'Pending Fines', value: stats.pendingFinesCount, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
    { title: 'Pending Requests', value: stats.pendingRequestsCount, icon: History, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-800 tracking-tight mb-2">
            Librarian Dashboard
          </h1>
          <p className="text-slate-500 flex items-center gap-2 font-medium">
            <Activity size={16} className="text-indigo-500" />
            Live overview of library metrics
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
             <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {statCards.map((stat, i) => (
            <AnimatedCard
              key={i}
              className="p-0 border-slate-200 bg-white"
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
                   <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                     <TrendingUp size={14} /> Active
                   </div>
                 </div>
                 
                 <div>
                   <h3 className="text-slate-500 font-medium mb-1">{stat.title}</h3>
                   <div className="text-3xl font-display font-bold text-slate-800">
                     {stat.value.toLocaleString()}
                   </div>
                 </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <AnimatedCard className="lg:col-span-2 shadow-sm border-slate-200 bg-white">
            <h3 className="text-xl font-display font-semibold text-slate-800 mb-6">Issue vs Return Trends</h3>
            <div className="h-[300px] w-full flex items-center justify-center">
               {chartData.datasets && chartData.datasets.length >= 2 ? (
                 <Line 
                    data={{
                      labels: chartData.labels,
                      datasets: [
                        {
                          ...chartData.datasets[0],
                          borderColor: '#4f46e5',
                          backgroundColor: 'rgba(79, 70, 229, 0.1)',
                          tension: 0.4,
                          fill: true,
                          pointBackgroundColor: '#ffffff',
                          pointBorderColor: '#4f46e5',
                          pointBorderWidth: 2,
                        },
                        {
                          ...chartData.datasets[1],
                          borderColor: '#0ea5e9',
                          backgroundColor: 'rgba(14, 165, 233, 0.1)',
                          tension: 0.4,
                          fill: true,
                          pointBackgroundColor: '#ffffff',
                          pointBorderColor: '#0ea5e9',
                          pointBorderWidth: 2,
                        }
                      ]
                    }} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { labels: { color: '#64748b', font: { family: "'Inter', sans-serif", weight: '500' } } }
                      },
                      scales: {
                        // FIX: Added min: 0 to prevent negative dips
                        y: { 
                           beginAtZero: true, 
                           min: 0,
                           ticks: { color: '#64748b', stepSize: 1 },
                           grid: { color: '#f1f5f9' } 
                        },
                        x: { 
                           grid: { color: '#f1f5f9' }, 
                           ticks: { color: '#64748b' } 
                        }
                      }
                    }} 
                 />
               ) : (
                 <div className="text-slate-400 font-medium flex items-center gap-2">
                   <Activity size={20} /> Loading trend data...
                 </div>
               )}
            </div>
         </AnimatedCard>

         <AnimatedCard className="shadow-sm border-slate-200 bg-white">
             <h3 className="text-xl font-display font-semibold text-slate-800 mb-6">Activity Breakdown</h3>
             <div className="h-[300px] w-full flex items-center justify-center">
               {userBreakdown.some(count => count > 0) ? (
                  <Bar 
                    data={{
                      labels: ['Students', 'Professors', 'Staff'],
                      datasets: [{
                         label: 'Active Users',
                         data: userBreakdown, // Uses real data from DB
                         backgroundColor: [
                           'rgba(79, 70, 229, 0.8)',
                           'rgba(14, 165, 233, 0.8)',
                           'rgba(244, 63, 94, 0.8)'
                         ],
                         borderRadius: 6
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                         y: { display: false },
                         x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: '500' } } }
                      }
                    }}
                  />
               ) : (
                  <div className="text-slate-400 font-medium">No users found</div>
               )}
             </div>
         </AnimatedCard>
      </div>

    </div>
  );
};

export default Dashboard;