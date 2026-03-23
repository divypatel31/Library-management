import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  History,
  AlertCircle,
  Megaphone,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Library,
  BookDown,
  BookUp,
  Clock // NEW: Imported the Clock icon for the history tab
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLinks = () => {
    if (!user) return [];
    
    const role = user.role;
    
    if (role === 'Admin') {
      return [
        { path: '/admin', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', name: 'User Management', icon: Users },
        { path: '/admin/books', name: 'Book Management', icon: BookOpen },
        { path: '/admin/history', name: 'Issue History', icon: History },
        { path: '/admin/requests', name: 'Manage Requests', icon: BookUp },
        { path: '/admin/fines', name: 'Fines', icon: AlertCircle },
        { path: '/admin/reports', name: 'Reports', icon: BookDown },
        { path: '/admin/announcements', name: 'Announcements', icon: Megaphone },
      ];
    }
    
    if (role === 'Librarian') {
       return [
        { path: '/librarian', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/librarian/books', name: 'Book Management', icon: BookOpen },
        { path: '/librarian/requests', name: 'Manage Requests', icon: BookUp },
        { path: '/librarian/my-requests', name: 'My Requests', icon: Clock }, // <-- NEW
        { path: '/librarian/issues', name: 'Issue / Return', icon: History },
        { path: '/librarian/users', name: 'User Management', icon: Users },
        { path: '/librarian/fines', name: 'Fines', icon: AlertCircle },
        { path: '/librarian/announcements', name: 'Announcements', icon: Megaphone },
      ];
    }

    if (role === 'Student' || role === 'Professor') {
       const basePath = role.toLowerCase();
       return [
        { path: `/${basePath}`, name: 'Dashboard', icon: LayoutDashboard },
        { path: `/${basePath}/browse`, name: 'Browse Books', icon: BookOpen },
        { path: `/${basePath}/issued`, name: 'My Books', icon: History },
        { path: `/${basePath}/my-requests`, name: 'My Requests', icon: Clock }, // <-- NEW
        { path: `/${basePath}/fines`, name: 'Fines', icon: AlertCircle },
        { path: `/${basePath}/notifications`, name: 'Notifications', icon: Megaphone },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    <motion.aside
      animate={{ width: isOpen ? 260 : 80 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
      className="h-screen bg-white border-r border-slate-200 flex flex-col relative shrink-0 z-50 shadow-sm"
    >
      <div className="p-5 flex items-center justify-between">
         <motion.div 
            className="flex items-center gap-3 overflow-hidden"
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
         >
           <Library className="text-indigo-600 shrink-0" size={28} />
           {isOpen && <span className="text-xl font-display font-bold text-slate-800 whitespace-nowrap">LibOrbit</span>}
         </motion.div>
         
         {!isOpen && (
            <Library className="text-indigo-600 absolute left-1/2 -translate-x-1/2" size={28} />
         )}

         <button 
           onClick={() => setIsOpen(!isOpen)}
           className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 hover:text-slate-600 absolute -right-4 top-6 z-50 shadow-sm"
         >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
         </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
        <nav className="flex flex-col gap-1.5 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path.split('/').length === 2}
                className={({ isActive }) => clsx(
                  "flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all duration-200 relative group overflow-hidden font-medium text-sm",
                  isActive 
                    ? "bg-indigo-50 bg-opacity-80 text-indigo-700" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={clsx("shrink-0", isActive ? "text-indigo-600" : "")} />
                    <motion.span 
                      animate={{ opacity: isOpen ? 1 : 0, display: isOpen ? 'block' : 'none' }}
                      className="whitespace-nowrap"
                    >
                      {link.name}
                    </motion.span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
         <div className="flex items-center gap-3 mb-4 px-2 overflow-hidden">
             <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0 border border-indigo-200">
                {user?.name?.charAt(0) || 'U'}
             </div>
             <motion.div 
               animate={{ opacity: isOpen ? 1 : 0, display: isOpen ? 'block' : 'none' }}
               className="whitespace-nowrap"
             >
                <div className="text-sm font-semibold text-slate-800">{user?.name || 'User'}</div>
                <div className="text-xs text-slate-500 font-medium">{user?.role}</div>
             </motion.div>
         </div>

         <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
         >
            <LogOut size={18} className="shrink-0" />
            <motion.span animate={{ opacity: isOpen ? 1 : 0, display: isOpen ? 'block' : 'none' }} className="whitespace-nowrap">Logout</motion.span>
         </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;