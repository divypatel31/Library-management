import { useState } from 'react';
import { BookOpen, User, Tag, Hash, Layers, Plus, Minus, Trash2 } from 'lucide-react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BookDetailsModal = ({ isOpen, onClose, book, onUpdate }) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !book) return null;

  const isStaff = user?.role === 'Admin' || user?.role === 'Librarian';

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
      // Send the update to the backend
      await api.put(`/books/${book._id}`, { ...book, quantity: newQuantity });
      
      // Trigger a refresh in the main browser so the numbers update instantly
      if (onUpdate) onUpdate(); 
      
      // Also update the local state of the modal so it changes immediately without closing
      book.quantity = newQuantity;
      book.available = book.available + change;
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Details">
      <div className="p-6 flex flex-col md:flex-row gap-6 relative">
        
        {/* Left Side: Cover Image */}
        <div className="w-full md:w-1/3 shrink-0">
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <img 
              src={book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg` : 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300'} 
              alt={book.title} 
              className="w-full h-full object-cover" 
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
              <User size={18} /> {book.author}
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
          <div className="pt-6 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-2 flex items-center gap-1.5 font-medium"><Layers size={14}/> Total Copies</p>
              
              <div className="flex items-center gap-4">
                {/* QTY MINUS BUTTON */}
                {isStaff && (
                  <button 
                    disabled={isUpdating}
                    onClick={() => handleQuantityChange(-1)}
                    className="w-8 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </button>
                )}
                
                <span className="text-3xl font-display font-bold text-slate-800">{book.quantity}</span>
                
                {/* QTY PLUS BUTTON */}
                {isStaff && (
                  <button 
                    disabled={isUpdating}
                    onClick={() => handleQuantityChange(1)}
                    className="w-8 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
            </div>
            
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
      
      {/* Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-2xl">
        <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold transition-colors shadow-sm">
          Close
        </button>
      </div>
    </Modal>
  );
};

export default BookDetailsModal;