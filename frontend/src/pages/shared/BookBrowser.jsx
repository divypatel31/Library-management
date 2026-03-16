import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookMarked, Filter, ArrowRight, PlusCircle, Save } from 'lucide-react';
import AnimatedCard from '../../components/AnimatedCard';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const BookBrowser = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  
  const { user } = useAuth();
  const [isAddRoute, setIsAddRoute] = useState(false);
  const [addForm, setAddForm] = useState({
     title: '', author: '', isbn: '', category: '', quantity: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCustomRequestModalOpen, setIsCustomRequestModalOpen] = useState(false);
  const [customRequestForm, setCustomRequestForm] = useState({ title: '', author: '', edition: '' });
  const [isCustomSubmitting, setIsCustomSubmitting] = useState(false);

  const handleCustomRequest = async (e) => {
     e.preventDefault();
     setIsCustomSubmitting(true);
     try {
        await api.post('/requests/custom', customRequestForm);
        alert('Custom book request submitted successfully!');
        setIsCustomRequestModalOpen(false);
        setCustomRequestForm({ title: '', author: '', edition: '' });
     } catch (error) {
        alert(error.response?.data?.message || 'Failed to submit custom request');
     } finally {
        setIsCustomSubmitting(false);
     }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/books');
      setBooks(res.data);
    } catch (error) {
      console.error("Failed to fetch catalog");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequestBook = async (bookId) => {
     try {
       await api.post('/requests', { bookId });
       // Optimistic update
       alert(`Request submitted successfully!`);
       setSelectedBook(null);
     } catch (error) {
       alert(error.response?.data?.message || 'Failed to submit request');
     }
  };

  const handleAddBook = async (e) => {
     e.preventDefault();
     setIsSubmitting(true);
     try {
        const payload = {
           ...addForm,
           quantity: parseInt(addForm.quantity) || 1
        };
        const res = await api.post('/books', payload);
        setBooks([res.data, ...books]);
        setIsAddRoute(false);
        setAddForm({ title: '', author: '', isbn: '', category: '', quantity: '' });
     } catch (error) {
        alert(error.response?.data?.message || 'Failed to add book');
     } finally {
        setIsSubmitting(false);
     }
  };

  const canAddBook = user?.role === 'Admin' || user?.role === 'Librarian';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800 tracking-tight mb-2">
            Library Catalog
          </h1>
          <p className="text-slate-500 font-medium">Browse and search thousands of digital and physical resources.</p>
        </div>
        {canAddBook && (
           <button 
             onClick={() => setIsAddRoute(true)}
             className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-sm transition-all shadow-indigo-200 hover:-translate-y-0.5"
           >
              <PlusCircle size={20} />
              Add New Book
           </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-8">
         <div className="relative flex-1 group">
            <div className="relative flex items-center bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden focus-within:border-indigo-500 focus-within:shadow-md transition-all">
               <div className="pl-4 pr-2 text-slate-400">
                  <Search size={20} />
               </div>
               <input 
                 type="text" 
                 placeholder="Search by title, author, or category..."
                 className="flex-1 py-3.5 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
         <button className="px-6 py-3.5 rounded-2xl bg-white shadow-sm border border-slate-200 hover:bg-slate-50 flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-all font-semibold">
            <Filter size={20} />
            <span className="hidden sm:inline">Filters</span>
         </button>
      </div>

      {/* Book Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
           {[...Array(10)].map((_, i) => (
             <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AnimatePresence>
            {filteredBooks.map((book, i) => (
               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 transition={{ duration: 0.2, delay: i * 0.05 }}
                 key={book._id}
                 onClick={() => setSelectedBook(book)}
                 className="group cursor-pointer perspective-[1000px]"
               >
                 <div className="relative h-64 rounded-2xl overflow-hidden mb-4 border border-slate-200 shadow-sm group-hover:shadow-[0_10px_30px_rgba(79,70,229,0.15)] group-hover:border-indigo-200 transition-all transform group-hover:-translate-y-1 preserve-3d bg-white">
                    <img 
                       src={book.coverImage} 
                       alt={book.title}
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                    
                    <div className="absolute bottom-4 left-4 right-4 relative z-10">
                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2 inline-block shadow-sm backdrop-blur-md
                          ${book.available > 0 
                             ? 'bg-white/90 text-emerald-700' 
                             : 'bg-white/90 text-rose-700'}
                       `}>
                          {book.available > 0 ? `${book.available} Available` : 'Out of Stock'}
                       </span>
                    </div>
                 </div>
                 
                 <div className="px-1">
                   <h3 className="text-slate-800 font-bold line-clamp-1 group-hover:text-indigo-600 transition-colors">{book.title}</h3>
                   <p className="text-slate-500 font-medium text-sm">{book.author}</p>
                 </div>
               </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredBooks.length === 0 && (
             <div className="col-span-full py-20 text-center text-slate-500 font-medium border border-dashed border-slate-300 bg-slate-50/50 rounded-2xl flex flex-col items-center">
               <p className="mb-4">No resources found matching your search.</p>
               {user?.role?.toLowerCase() !== 'admin' && (
                  <button 
                     onClick={() => setIsCustomRequestModalOpen(true)}
                     className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-sm inline-block"
                  >
                     Request a Custom Book
                  </button>
               )}
             </div>
          )}
        </div>
      )}

      {/* Custom Book Request Banner */}
      {!isLoading && filteredBooks.length > 0 && user?.role?.toLowerCase() !== 'admin' && (
         <div className="mt-8 p-8 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
               <h3 className="text-xl font-bold text-indigo-900 mb-2">Can't find what you're looking for?</h3>
               <p className="text-indigo-700">Request a custom book and our library staff will review it for acquisition.</p>
            </div>
            <button 
               onClick={() => setIsCustomRequestModalOpen(true)}
               className="shrink-0 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm"
            >
               Request Custom Book
            </button>
         </div>
      )}

      {/* Book Details Modal */}
      <Modal isOpen={!!selectedBook} onClose={() => setSelectedBook(null)} title={selectedBook?.title}>
         {selectedBook && (
            <div className="flex flex-col md:flex-row gap-6">
               <div className="w-full md:w-1/3 shrink-0">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden border border-slate-200 shadow-md">
                     <img src={selectedBook.coverImage} alt={selectedBook.title} className="w-full h-full object-cover" />
                  </div>
               </div>
               <div className="flex-1 flex flex-col">
                  <div className="mb-6">
                     <h3 className="text-2xl font-bold text-slate-800 mb-1">{selectedBook.title}</h3>
                     <p className="text-indigo-600 font-medium mb-4">{selectedBook.author}</p>
                     
                     <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-3 mb-6 gap-4">
                        <div className="flex-1 text-center border-r border-slate-200">
                           <div className="text-slate-400 font-semibold text-xs mb-1">Category</div>
                           <div className="text-slate-700 text-sm font-bold">{selectedBook.category}</div>
                        </div>
                        <div className="flex-1 text-center">
                           <div className="text-slate-400 font-semibold text-xs mb-1">Availability</div>
                           <div className={`text-sm font-bold ${selectedBook.available > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {selectedBook.available} / {selectedBook.quantity}
                           </div>
                        </div>
                     </div>

                     <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                        An excellent piece of literature covering fundamental concepts in <span className="text-slate-800 font-bold">{selectedBook.category}</span>. This resource is highly recommended for relevant coursework.
                     </p>
                  </div>
                  
                  <div className="mt-auto">
                     {selectedBook.available > 0 ? (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 shadow-sm">
                           <BookMarked className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                           <div>
                              <div className="font-bold text-emerald-800">Available to Issue</div>
                              <div className="text-emerald-600 text-sm font-medium mt-1">Please visit the librarian desk to physically issue this book using your ID.</div>
                           </div>
                        </div>
                     ) : (
                        <motion.button 
                           whileHover={{ y: -2 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => handleRequestBook(selectedBook._id)}
                           className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                        >
                           Request Unavailable Book
                           <ArrowRight size={18} />
                        </motion.button>
                     )}
                   </div>
                </div>
             </div>
          )}
       </Modal>

       {/* Add Book Modal */}
       <Modal isOpen={isAddRoute} onClose={() => setIsAddRoute(false)} title="Add New Resource">
          <form onSubmit={handleAddBook} className="space-y-5 px-1">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Title" required value={addForm.title} onChange={e => setAddForm({...addForm, title: e.target.value})} placeholder="e.g. Design Patterns" />
                <Input label="Author" required value={addForm.author} onChange={e => setAddForm({...addForm, author: e.target.value})} placeholder="e.g. Gang of Four" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Input label="ISBN" required value={addForm.isbn} onChange={e => setAddForm({...addForm, isbn: e.target.value})} placeholder="Unique identifier" />
                <Input label="Category" required value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value})} placeholder="e.g. Computer Science" />
                <Input label="Quantity" required type="number" min="1" value={addForm.quantity} onChange={e => setAddForm({...addForm, quantity: e.target.value})} placeholder="e.g. 5" />
             </div>
             <div className="pt-4 flex justify-end">
                <button disabled={isSubmitting} type="submit" className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50">
                   {isSubmitting ? 'Saving...' : <><Save size={18} /> Add to Catalog</>}
                </button>
             </div>
          </form>
       </Modal>

       {/* Custom Book Request Modal */}
       <Modal isOpen={isCustomRequestModalOpen} onClose={() => setIsCustomRequestModalOpen(false)} title="Request Custom Book">
          <form onSubmit={handleCustomRequest} className="space-y-5 px-1">
             <div className="space-y-4">
                <Input label="Book Title" required value={customRequestForm.title} onChange={e => setCustomRequestForm({...customRequestForm, title: e.target.value})} placeholder="e.g. Introduction to Algorithms" />
                <Input label="Author" required value={customRequestForm.author} onChange={e => setCustomRequestForm({...customRequestForm, author: e.target.value})} placeholder="e.g. Thomas H. Cormen" />
                <Input label="Edition (Optional)" value={customRequestForm.edition} onChange={e => setCustomRequestForm({...customRequestForm, edition: e.target.value})} placeholder="e.g. 3rd Edition" />
             </div>
             <div className="pt-4 flex justify-end">
                <button disabled={isCustomSubmitting} type="submit" className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50">
                   {isCustomSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
             </div>
          </form>
       </Modal>
    </div>
  );
};

export default BookBrowser;

