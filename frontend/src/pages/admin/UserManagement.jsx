import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, Search, ShieldCheck, Edit2 } from 'lucide-react';
import AnimatedCard from '../../components/AnimatedCard';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import EditUserModal from '../../components/EditUserModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const { user } = useAuth();
  
  // Debug Log to see why the conditional fails
  console.log('UserManagement Render. Active User:', user, 'Role match:', user?.role === 'Admin');

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    roll_no: '',
    department: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
       console.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
     if(window.confirm('Are you sure you want to delete this user?')) {
        try {
           await api.delete(`/users/${id}`);
           setUsers(users.filter(u => u._id !== id));
        } catch (error) {
           console.error("Failed to delete user");
        }
     }
  };

  const handleEditClick = (userToEdit) => {
    setSelectedUser(userToEdit);
    setEditModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      // 1. Create the user in the database
      await api.post('/users', formData);
      
      // 2. THE FIX: Fetch the complete fresh list immediately
      await fetchUsers();
      
      // 3. Close and reset the modal
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'Student', roll_no: '', department: '' });
    } catch (error) {
      console.error("Failed to create user", error);
      alert(error.response?.data?.message || "Error creating user");
    }
  };

  // UPDATE: Now correctly filters by Department and Roll No as well!
  const filteredUsers = users.filter(u => {
    const search = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(search) || 
      u.email?.toLowerCase().includes(search) ||
      u.role?.toLowerCase().includes(search) ||
      u.department?.toLowerCase().includes(search) ||
      u.roll_no?.toLowerCase().includes(search)
    );
  });

  const columns = [
    { header: 'Name', accessor: 'name', render: (row) => (
       <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
             {row.name.charAt(0)}
          </div>
          <span className="font-semibold text-slate-800">{row.name}</span>
       </div>
    )},
    { header: 'Email', accessor: 'email', render: (row) => <span className="text-slate-600">{row.email}</span> },
    { header: 'Role', accessor: 'role', render: (row) => (
       <span className={`px-3 py-1 rounded-full text-xs font-semibold border
          ${row.role === 'Admin' ? 'bg-rose-50 text-rose-600 border-rose-200' : ''}
          ${row.role === 'Librarian' ? 'bg-sky-50 text-sky-600 border-sky-200' : ''}
          ${row.role === 'Professor' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : ''}
          ${row.role === 'Student' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : ''}
       `}>
          {row.role}
       </span>
    )},
    { header: 'Department', accessor: 'department', render: (row) => <span className="text-slate-600">{row.department || '-'}</span> },
    { header: 'Roll No', accessor: 'roll_no', render: (row) => <span className="text-slate-600">{row.roll_no || '-'}</span> },
    { header: 'Joined', accessor: 'createdAt', render: (row) => <span className="text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</span> },
    { header: 'Actions', accessor: '_id', render: (row) => (
       <div className="flex items-center gap-2">
          <button 
             onClick={() => handleEditClick(row)}
             className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white rounded-lg transition-colors border border-indigo-100"
             title="Edit User"
          >
             <Edit2 size={16} />
          </button>
          <button 
             onClick={() => handleDelete(row._id)}
             className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors border border-rose-100"
             title="Delete User"
          >
             <Trash2 size={16} />
          </button>
       </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800 tracking-tight mb-2">
            User Management
          </h1>
          <p className="text-slate-500 font-medium">Manage accounts, roles, and access credentials.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <UserPlus size={18} />
          Create User
        </motion.button>
      </div>

      <AnimatedCard className="p-0 border border-slate-200 shadow-sm bg-white">
         <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by name, dept, roll no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl text-slate-800 shadow-sm outline-none transition-colors"
                />
             </div>
             
             <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm font-medium">
                <ShieldCheck size={16} className="text-indigo-600" />
                <span>{users.length} Total Accounts</span>
             </div>
         </div>
         
         {isLoading ? (
            <div className="p-8 text-center text-slate-500 font-medium tracking-wide">Loading users...</div>
         ) : (
            <div className="p-0">
               <DataTable columns={columns} data={filteredUsers} />
            </div>
         )}
      </AnimatedCard>

      {/* Create User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Account">
         <form onSubmit={handleCreateUser} className="space-y-4">
            <Input 
               label="Full Name" 
               placeholder="Enter user's name" 
               required
               value={formData.name}
               onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <Input 
               label="Email Address" 
               type="email" 
               placeholder="user@example.com" 
               required
               value={formData.email}
               onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input 
               label="Password" 
               type="password" 
               placeholder="Create a strong password" 
               required
               value={formData.password}
               onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            
            <div className="mb-4">
               <label className="block mb-1.5 text-sm font-medium text-slate-600">System Role</label>
               <select 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 shadow-sm outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
               >
                  <option value="Student">Student</option>
                  <option value="Professor">Professor</option>
                  {user?.role?.toLowerCase() === 'admin' && (
                     <>
                        <option value="Librarian">Librarian</option>
                        <option value="Admin">Administrator</option>
                     </>
                  )}
               </select>
            </div>

            {formData.role === 'Student' && (
               <Input 
                  label="Roll Number" 
                  placeholder="e.g. CS2024-001" 
                  required
                  value={formData.roll_no}
                  onChange={(e) => setFormData({...formData, roll_no: e.target.value})}
               />
            )}

            {(formData.role === 'Student' || formData.role === 'Professor') && (
               <Input 
                  label="Department" 
                  placeholder="e.g. Computer Science" 
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
               />
            )}

            <div className="pt-4 flex gap-4">
               <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
               >
                  Cancel
               </button>
               <button 
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow text-white font-bold transition-all cursor-pointer"
               >
                  Provision Account
               </button>
            </div>
         </form>
      </Modal>

      {/* Edit User Modal */}
      <EditUserModal 
         isOpen={editModalOpen}
         onClose={() => setEditModalOpen(false)}
         user={selectedUser}
         onSuccess={fetchUsers}
      />

    </div>
  );
};

export default UserManagement;