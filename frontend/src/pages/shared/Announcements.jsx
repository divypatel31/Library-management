import { useState, useEffect } from 'react';
import { Megaphone, Calendar, Plus, User, Trash2, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import AnimatedCard from '../../components/AnimatedCard';

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  
  // Forms state
  const [form, setForm] = useState({ title: '', message: '' });
  const [bulkDates, setBulkDates] = useState({ startDate: '', endDate: '' });

  const isStaff = user?.role === 'Admin' || user?.role === 'Librarian';

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  // Create Announcement
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', form);
      await fetchAnnouncements();
      setIsModalOpen(false);
      setForm({ title: '', message: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create announcement');
    }
  };

  // Delete Single Announcement
  const handleDeleteSingle = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/announcements/${id}`);
      await fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  // Bulk Delete by Date
  const handleBulkDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Warning: This will permanently delete ALL announcements between ${bulkDates.startDate} and ${bulkDates.endDate}. Proceed?`)) return;
    
    try {
      const res = await api.post('/announcements/bulk-delete', bulkDates);
      alert(res.data.message);
      await fetchAnnouncements();
      setIsBulkDeleteModalOpen(false);
      setBulkDates({ startDate: '', endDate: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to perform bulk delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800 tracking-tight">Announcements</h1>
          <p className="text-slate-500 mt-1">Stay updated with library news and notices.</p>
        </div>
        {isStaff && (
          <div className="flex gap-3">
            <button 
              onClick={() => setIsBulkDeleteModalOpen(true)} 
              className="py-2.5 px-4 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
              <Trash2 size={18} /> Bulk Delete
            </button>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus size={18} /> Post Update
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-slate-500 animate-pulse">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
          <Megaphone size={40} className="mx-auto mb-4 opacity-50" />
          <p>No announcements posted yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((ann) => (
            <AnimatedCard key={ann._id} className="bg-white border-slate-200 relative group">
              {/* Single Delete Button for Staff */}
              {isStaff && (
                <button
                  onClick={() => handleDeleteSingle(ann._id, ann.title)}
                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Delete Announcement"
                >
                  <Trash2 size={18} />
                </button>
              )}

              <div className="flex gap-4 items-start pr-10">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hidden sm:block shrink-0">
                  <Megaphone size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{ann.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">{ann.message}</p>
                  <div className="flex gap-4 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(ann.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><User size={14} /> {ann.authorName} ({ann.authorRole})</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}

      {/* Post Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post Announcement">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Library Closed on Friday" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
            <textarea 
              required 
              value={form.message} 
              onChange={e => setForm({...form, message: e.target.value})} 
              rows="4" 
              placeholder="Enter announcement details..."
              /* FIX: Added text-slate-800, bg-white, and placeholder-slate-400 */
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 bg-white placeholder-slate-400"
            ></textarea>
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Post Announcement</button>
        </form>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} title="Bulk Delete Announcements">
        <form onSubmit={handleBulkDelete} className="space-y-4">
          <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex gap-3 text-sm">
            <AlertTriangle size={20} className="shrink-0" />
            <p>This will permanently delete all announcements within the selected date range. This action cannot be undone.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Start Date" 
              type="date" 
              required 
              value={bulkDates.startDate} 
              onChange={e => setBulkDates({...bulkDates, startDate: e.target.value})} 
            />
            <Input 
              label="End Date" 
              type="date" 
              required 
              value={bulkDates.endDate} 
              onChange={e => setBulkDates({...bulkDates, endDate: e.target.value})} 
            />
          </div>
          <button type="submit" className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 mt-2">
            Delete Records
          </button>
        </form>
      </Modal>

    </div>
  );
};

export default Announcements;