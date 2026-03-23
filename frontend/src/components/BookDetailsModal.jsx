import { useState } from 'react';
import { BookOpen, User, Tag, Hash, Layers, Plus, Minus, Send, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BookDetailsModal = ({ isOpen, onClose, book, onUpdate }) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // NEW STATES FOR REQUEST FEATURE
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  if (!isOpen || !book) return null;

  const isStaff = user?.role === 'Admin' || user?.role === 'Librarian';
  const isUser = user?.role === 'Student' || user?.role === 'Professor';

  // Existing Stock Update Function (For Librarians/Admins)
  const handleQuantityChange = async (change) => {
    const newQuantity = book.quantity + change;
    
    // Prevent quantity from dropping below the number of currently issued books
    const currentlyIssued = book.quantity - book.available;
    if (newQuantity < currentlyIssued) {
      alert(`Cannot reduce quantity below ${currentlyIssued} because those copies are currently issued to users.`);
      return;
    }

    setIsUpdating(true);
    try {
      await api.put(`/books/${book._id}`, { ...book, quantity: newQuantity });
      if (onUpdate) onUpdate(); 
      book.quantity = newQuantity;
      book.available = book.available + change;
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  // NEW REQUEST BOOK FUNCTION (For Students/Professors)
  const handleRequestBook = async () => {
    setIsRequesting(true);
    try {
      // Hits your existing Standard Book Request endpoint
      await api.post('/requests', { bookId: book._id });
      setRequestSuccess(true);
      
      // Auto-reset success message after 3 seconds
      setTimeout(() => setRequestSuccess(false), 3000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit request. You may already have a pending request for this book.');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Details">
      <div className="p-6 flex flex-col md:flex-row gap-6 relative">
        
        {/* Left Side: Cover Image */}
        <div className="w-full md:w-1/3 shrink-0">
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative group">
            <img 
              src={book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg` : 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300'} 
              alt={book.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300';
              }}
            />
          </div>
        </div>
        
        {/* Right Side: Details */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 leading-tight pr-8">{book.title}</h2>
            <p className="text-lg text-slate-600 flex items-center gap-2 mt-1">
              <User size={18} className="text-slate-400" /> {book.author}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold flex items-center gap-1.5 border border-indigo-100">
              <Tag size={14} /> {book.category}
            </span>
            <span className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-1.5 border border-slate-200">
              <Hash size={14} /> ISBN: {book.isbn}
            </span>
          </div>

          {/* Stock Info Cards */}
          <div className="pt-4 grid grid-cols-2 gap-4">
            
            {/* Total Copies Card (Interactive for Staff, Read-Only for Users) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-2 flex items-center gap-1.5 font-medium"><Layers size={14}/> Total Copies</p>
              
              <div className="flex items-center gap-3">
                {isStaff && (
                  <button 
                    disabled={isUpdating}
                    onClick={() => handleQuantityChange(-1)}
                    className="w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Minus size={14} />
                  </button>
                )}
                
                <span className="text-3xl font-display font-bold text-slate-800">{book.quantity}</span>
                
                {isStaff && (
                  <button 
                    disabled={isUpdating}
                    onClick={() => handleQuantityChange(1)}
                    className="w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Available Now Card */}
            <div className={`p-4 rounded-xl border ${book.available > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <p className={`text-sm mb-1 flex items-center gap-1.5 font-medium ${book.available > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                <BookOpen size={14}/> Available Now
              </p>
              <p className={`text-3xl font-display font-bold ${book.available > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {book.available}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer / Action Bar */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center rounded-b-2xl">
        
        {/* Left Side: Request Action (For Students/Professors) */}
        <div>
          {isUser && book.available > 0 ? (
             requestSuccess ? (
               <div className="flex items-center gap-2 text-emerald-600 font-bold px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                 <CheckCircle2 size={18} /> Request Sent!
               </div>
             ) : (
               <button 
                 onClick={handleRequestBook}
                 disabled={isRequesting}
                 className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
               >
                 {isRequesting ? 'Sending...' : <><Send size={18} /> Request Issue</>}
               </button>
             )
          ) : isUser && book.available === 0 ? (
             <div className="flex items-center gap-2 text-rose-500 font-medium px-4 py-2 bg-rose-50 rounded-xl border border-rose-100">
               <BookOpen size={16} /> Currently Out of Stock
             </div>
          ) : (
             <div>{/* Empty div to keep 'Close' button on the right for staff */}</div>
          )}
        </div>

        {/* Right Side: Close Button */}
        <button 
          onClick={onClose} 
          className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold transition-colors shadow-sm"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default BookDetailsModal;