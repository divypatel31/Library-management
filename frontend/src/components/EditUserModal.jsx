import { useState, useEffect } from 'react';
import { User, Mail, Building, Hash, Save, Lock } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import api from '../services/api';

const EditUserModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: '',
    department: '',
    roll_no: ''
  });
  const [loading, setLoading] = useState(false);

  // Load user data into the form when the modal opens
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || user.name || '',
        email: user.email || '',
        role: user.role || '',
        department: user.department || '',
        roll_no: user.rollNo || user.roll_no || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/users/${user._id || user.user_id}`, formData);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  // Helper variables to check the role cleanly
  const isStudent = formData.role?.toLowerCase() === 'student';
  const isProfessor = formData.role?.toLowerCase() === 'professor';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User Profile">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input 
          label="Full Name" 
          icon={User}
          value={formData.full_name}
          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          required
        />
        <Input 
          label="Email Address" 
          icon={Mail}
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        
        <div className="grid grid-cols-2 gap-4">
          {/* LOCKED ROLE FIELD */}
          <div className="relative">
            <div className="absolute top-9 right-4 text-slate-400">
              <Lock size={16} />
            </div>
            <Input 
              label="Role (Locked)" 
              value={formData.role}
              readOnly={true}
              className="bg-slate-50 text-slate-500 font-semibold cursor-not-allowed border-slate-200"
              onChange={() => {}}
            />
          </div>

          {/* DYNAMIC FIELD: Only show Roll Number if the user is a Student */}
          {isStudent && (
            <Input 
              label="Roll Number" 
              icon={Hash}
              value={formData.roll_no}
              onChange={(e) => setFormData({...formData, roll_no: e.target.value})}
            />
          )}
        </div>

        {/* DYNAMIC FIELD: Only show Department if they are a Student or Professor */}
        {(isStudent || isProfessor) && (
          <Input 
            label="Department" 
            icon={Building}
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
          />
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 mt-4"
        >
          {loading ? 'Saving Changes...' : <><Save size={18} /> Update User Info</>}
        </button>
      </form>
    </Modal>
  );
};

export default EditUserModal;