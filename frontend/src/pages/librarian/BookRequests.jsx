import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, BookOpen } from 'lucide-react';
import api from '../../services/api';
import AnimatedCard from '../../components/AnimatedCard';

const BookRequests = () => {
  const [standardRequests, setStandardRequests] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [stdRes, cstRes] = await Promise.all([
        api.get('/requests'),
        api.get('/requests/custom')
      ]);
      setStandardRequests(stdRes.data);
      setCustomRequests(cstRes.data);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleProcess = async (id, action, isCustom) => {
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
    try {
      const endpoint = isCustom ? `/requests/custom/${id}/${action}` : `/requests/${id}/${action}`;
      await api.put(endpoint);
      alert(`Request ${action}d successfully`);
      fetchData(); // Refresh the lists
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing request');
    }
  };

  const renderRequestCard = (req, isCustom) => (
    <AnimatedCard key={req._id} className="bg-white border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-slate-800">{req.book.title}</h3>
            {isCustom && <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-100 text-amber-700 rounded">New Purchase Request</span>}
          </div>
          <p className="text-slate-500 text-sm font-medium mb-3">by {req.book.author} {req.book.edition && `(${req.book.edition})`}</p>
          <div className="text-xs text-slate-500 space-y-1">
            <p>Requested by: <span className="font-semibold text-slate-700">{req.user.name}</span> ({req.user.role})</p>
            {req.user.rollNo && <p>Roll No: {req.user.rollNo}</p>}
            <p className="flex items-center gap-1 mt-2 text-indigo-600"><Clock size={14}/> {new Date(req.requestDate).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex md:flex-col gap-2 shrink-0 justify-end">
          <button onClick={() => handleProcess(req._id, 'approve', isCustom)} className="flex-1 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
            <CheckCircle2 size={16} /> Approve
          </button>
          <button onClick={() => handleProcess(req._id, 'reject', isCustom)} className="flex-1 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
            <XCircle size={16} /> Reject
          </button>
        </div>
      </div>
    </AnimatedCard>
  );

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-display font-bold text-slate-800 tracking-tight">Manage Requests</h1>
        <p className="text-slate-500 mt-1">Approve or reject book issues and custom acquisitions.</p>
      </div>

      {isLoading ? (
        <div className="text-slate-500 animate-pulse">Loading pending requests...</div>
      ) : (
        <>
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><BookOpen size={20} className="text-indigo-600"/> Standard Requests (In Catalog)</h2>
            {standardRequests.length === 0 ? (
              <p className="text-slate-500 italic p-4 bg-slate-50 rounded-xl">No pending standard requests.</p>
            ) : (
              <div className="grid gap-4">{standardRequests.map(req => renderRequestCard(req, false))}</div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><BookOpen size={20} className="text-amber-600"/> Custom Requests (Not in Catalog)</h2>
            {customRequests.length === 0 ? (
              <p className="text-slate-500 italic p-4 bg-slate-50 rounded-xl">No pending custom requests.</p>
            ) : (
              <div className="grid gap-4">{customRequests.map(req => renderRequestCard(req, true))}</div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default BookRequests;