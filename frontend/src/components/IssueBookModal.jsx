import { useState } from 'react';
import { Search, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import api from '../services/api';
import Modal from './Modal';
import Input from './Input';

const IssueBookModal = ({ isOpen, onClose, book, onSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  
  // Default to 7, but this will instantly change when a user is found
  const [durationDays, setDurationDays] = useState(7); 
  
  const [searchLoading, setSearchLoading] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Search for the User and FIX the duration
  const handleSearchUser = async (e) => {
    e.preventDefault();
    if (!identifier) return;
    
    setSearchLoading(true);
    setError('');
    setFoundUser(null);

    try {
      const res = await api.get(`/users/find/${identifier}`);
      const user = res.data;
      setFoundUser(user);
      
      // STRICT POLICY: Automatically lock in the exact days based on role
      if (user.role.toLowerCase() === 'student') {
        setDurationDays(30);
      } else if (user.role.toLowerCase() === 'professor') {
        setDurationDays(60);
      } else {
        setDurationDays(14); // Fallback for Staff/Admins
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'User not found.');
    } finally {
      setSearchLoading(false);
    }
  };

  // 2. Issue the Book
  const handleIssueBook = async () => {
    if (!foundUser) return;
    
    setIssueLoading(true);
    setError('');

    try {
      await api.post('/issues', {
        bookId: book._id || book.book_id,
        userId: foundUser._id || foundUser.user_id,
        durationDays
      });
      onSuccess(); 
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setIssueLoading(false);
    }
  };

  const handleClose = () => {
    setIdentifier('');
    setFoundUser(null);
    setError('');
    onClose();
  };

  if (!isOpen || !book) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Issue Book to User">
      <div className="p-6 space-y-6">
        
        {/* Book Info Summary */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-4 items-center">
          <div className="w-12 h-16 bg-slate-200 rounded-md overflow-hidden shrink-0 border border-slate-300 shadow-sm">
            <img 
              src={book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn.replace(/[- ]/g, '')}-M.jpg?default=false` : 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=100'} 
              alt={book.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=100';
              }}
            />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 leading-tight">{book.title}</h4>
            <p className="text-sm text-slate-500 mt-0.5">By {book.author}</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Step 1: Search Bar */}
        <form onSubmit={handleSearchUser} className="flex gap-2 items-end">
          <div className="flex-1">
            <Input 
              label="User Email or Roll No." 
              value={identifier} 
              onChange={(e) => setIdentifier(e.target.value)} 
              placeholder="e.g. divy@example.com or 21BCE001"
            />
          </div>
          <button 
            type="submit" 
            disabled={searchLoading || !identifier}
            className="h-[46px] px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {searchLoading ? 'Searching...' : <><Search size={18} /> Find</>}
          </button>
        </form>

        {/* Step 2: Auto-filled Details */}
        {foundUser && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-700 font-medium mb-3">
                <CheckCircle2 size={18} /> User Authenticated
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Full Name</p>
                  <p className="font-medium text-slate-800">{foundUser.name || foundUser.full_name}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Role</p>
                  <p className="font-medium text-slate-800">{foundUser.role}</p>
                </div>
              </div>
            </div>

            {/* FIXED DURATION DISPLAY */}
            <div className="relative">
              <div className="absolute top-9 right-4 text-slate-400">
                <Lock size={16} />
              </div>
              <Input 
                label="Loan Duration (Days) - Fixed Policy" 
                type="number" 
                value={durationDays} 
                readOnly={true} // This prevents the user from typing in this box!
                className="bg-slate-50 text-slate-600 font-bold cursor-not-allowed border-slate-200"
                onChange={() => {}} // Empty function because it's read-only
              />
              <p className="text-xs text-slate-500 mt-1.5 ml-1">
                Duration is automatically locked based on user role ({foundUser.role}).
              </p>
            </div>

            <button 
              onClick={handleIssueBook}
              disabled={issueLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 shadow-sm mt-2"
            >
              {issueLoading ? 'Issuing Book...' : `Confirm Issue to ${(foundUser.name || foundUser.full_name).split(' ')[0]}`}
            </button>
          </div>
        )}

      </div>
    </Modal>
  );
};

export default IssueBookModal;