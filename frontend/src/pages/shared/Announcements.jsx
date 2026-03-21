import { useState, useEffect } from 'react';
import { Megaphone, Calendar, Plus, User } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import AnimatedCard from '../../components/AnimatedCard';

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '' });

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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', form);
      await fetchAnnouncements(); // Refresh live
      setIsModalOpen(false);
      setForm({ title: '', message: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create announcement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800 tracking-tight">Announcements</h1>
          <p className="text-slate-500 mt-1">Stay updated with library news and notices.</p>
        </div>
        {isStaff && (
          <button onClick={() => setIsModalOpen(true)} className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium flex items-center gap-2">
            <Plus size={18} /> Post Update
          </button>
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
            <AnimatedCard key={ann._id} className="bg-white border-slate-200">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hidden sm:block"><Megaphone size={24} /></div>
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
            <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows="4" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"></textarea>
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Post Announcement</button>
        </form>
      </Modal>
    </div>
  );
};

export default Announcements;