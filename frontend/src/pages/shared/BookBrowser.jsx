import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, BookOpen, User, Tag, Hash, ArrowRightLeft, Save, Send, Trash2, Download } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import IssueBookModal from '../../components/IssueBookModal';
import BookDetailsModal from '../../components/BookDetailsModal';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

const BookBrowser = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Permissions
  const isStaff = user?.role === 'Admin' || user?.role === 'Librarian';
  const isAdmin = user?.role === 'Admin';

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBookForDetails, setSelectedBookForDetails] = useState(null);

  // Forms
  const [isAddRoute, setIsAddRoute] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', author: '', isbn: '', category: '', quantity: '' });
  
  // Request Form State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ title: '', author: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/books');
      setBooks(res.data);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBook = async (bookId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" completely from the catalog?`)) return;
    
    try {
      await api.delete(`/books/${bookId}`);
      fetchBooks(); // Instantly remove it from the screen
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete book. Make sure no copies are currently issued.');
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openIssueModal = (book) => { setSelectedBookForIssue(book); setIsIssueModalOpen(true); };
  const openDetailsModal = (book) => { setSelectedBookForDetails(book); setIsDetailsModalOpen(true); };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
       const payload = { ...addForm, quantity: parseInt(addForm.quantity) || 1 };
       await api.post('/books', payload);
       fetchBooks(); 
       setIsAddRoute(false);
       setAddForm({ title: '', author: '', isbn: '', category: '', quantity: '' });
    } catch (error) {
       alert(error.response?.data?.message || 'Failed to add book');
    } finally {
       setIsSubmitting(false);
    }
  };

  // Handle Requesting a Book
  const handleRequestBook = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
       await api.post('/requests/custom', requestForm);
       alert('Book request submitted successfully!');
       setIsRequestModalOpen(false);
       setRequestForm({ title: '', author: '', reason: '' });
    } catch (error) {
       alert(error.response?.data?.message || 'Failed to submit request');
    } finally {
       setIsSubmitting(false);
    }
  };

  // Generate Professional PDF Report (Vite-Compatible)
  const generateBookReportPDF = () => {
    const doc = new jsPDF();

    // Add Official Branding and Headers
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text("Liborbit Official", 14, 20);

    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text("Master Book Inventory Report", 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 38);
    doc.text(`Total Titles in Catalog: ${books.length}`, 14, 44);

    // Define the Table Columns
    const tableColumn = ["Title", "Author", "Category", "ISBN", "Stock (Avail/Total)"];
    
    // Map your Book Data into Rows
    const tableRows = books.map(book => [
      book.title,
      book.author,
      book.category || '-',
      book.isbn || 'N/A',
      `${book.available || 0} / ${book.quantity || 0}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      headStyles: { 
        fillColor: [79, 70, 229], // Liborbit Indigo
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] 
      },
      styles: { 
        fontSize: 10, 
        cellPadding: 4 
      },
      didDrawPage: function (data) {
        let str = 'Page ' + doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        let pageSize = doc.internal.pageSize;
        let pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      }
    });

    doc.save(`Liborbit_Book_Inventory_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800 tracking-tight">Library Catalog</h1>
          <p className="text-slate-500 mt-1">Browse, search, and manage library resources.</p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          {/* Request Book Button (Visible to everyone EXCEPT Admin) */}
          {!isAdmin && (
            <button 
              onClick={() => setIsRequestModalOpen(true)}
              className="py-2.5 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <Send size={18} /> Request a Book
            </button>
          )}

          {/* PDF Export and Add Book Buttons (Visible to Admin and Librarian) */}
          {isStaff && (
            <>
              <button 
                onClick={generateBookReportPDF}
                className="py-2.5 px-4 bg-white border border-slate-300 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
              >
                <Download size={18} /> Export PDF
              </button>
              <button 
                onClick={() => setIsAddRoute(true)}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                <Plus size={18} /> Add New Book
              </button>
            </>
          )}
        </div>
      </div>

      <div className="relative max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search by title, author, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-200"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredBooks.map((book) => (
              <motion.div key={book._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="h-40 bg-slate-100 flex items-center justify-center shrink-0 relative overflow-hidden group">
                   <img 
                     src={book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg` : 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300'} 
                     alt={book.title} 
                     className="w-full h-full object-cover"
                     onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300'; }}
                   />
                   
                   {/* Floating Delete Button for Staff */}
                   {isStaff && (
                     <button 
                       onClick={(e) => { e.stopPropagation(); handleDeleteBook(book._id, book.title); }}
                       className="absolute top-2 right-2 p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                       title="Delete Book"
                     >
                       <Trash2 size={16} />
                     </button>
                   )}

                   <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => openDetailsModal(book)} className="px-4 py-2 bg-white/90 text-slate-900 rounded-lg font-medium text-sm hover:bg-white transition-colors">
                        View Details
                      </button>
                   </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-semibold text-slate-800 line-clamp-2 leading-tight">{book.title}</h3>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold shrink-0 ${book.available > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                      {book.available} Left
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-slate-500 mb-6 flex-1">
                    <p className="flex items-center gap-2"><User size={14} /> {book.author}</p>
                    <p className="flex items-center gap-2"><Tag size={14} /> {book.category}</p>
                    <p className="flex items-center gap-2"><Hash size={14} /> {book.isbn}</p>
                  </div>

                  {isStaff && book.available > 0 ? (
                    <button onClick={() => openIssueModal(book)} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm">
                      <ArrowRightLeft size={16} /> Issue Book
                    </button>
                  ) : isStaff && book.available === 0 ? (
                    <button disabled className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-xl font-medium cursor-not-allowed text-sm flex items-center justify-center gap-2">
                      <BookOpen size={16} /> Out of Stock
                    </button>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredBooks.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl border-dashed">
              No books found matching your search.
            </div>
          )}
        </div>
      )}

      {/* Existing Modals */}
      <IssueBookModal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} book={selectedBookForIssue} onSuccess={fetchBooks} />
      
      <BookDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        book={selectedBookForDetails} 
        onUpdate={fetchBooks} 
      />

      {/* Add New Book Modal */}
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

      {/* Request Book Modal */}
      <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Request a New Book">
        <form onSubmit={handleRequestBook} className="space-y-5 px-1">
           <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 text-sm text-sky-700 mb-4">
              Can't find a book in the catalog? Submit a request to the library administration to have it added!
           </div>
           <div className="grid grid-cols-1 gap-5">
              <Input label="Book Title" required value={requestForm.title} onChange={e => setRequestForm({...requestForm, title: e.target.value})} placeholder="Title of the requested book" />
              <Input label="Author" required value={requestForm.author} onChange={e => setRequestForm({...requestForm, author: e.target.value})} placeholder="Author's name" />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Request</label>
                <textarea 
                  required 
                  value={requestForm.reason} 
                  onChange={e => setRequestForm({...requestForm, reason: e.target.value})} 
                  rows="3" 
                  placeholder="Why do you need this book? (e.g., Required for CS-101 coursework)"
                  /* THE FIX: Added text-slate-800, bg-white, and placeholder-slate-400 */
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 bg-white placeholder-slate-400"
                ></textarea>
              </div>
           </div>
           
           <div className="pt-4 flex justify-end">
              <button disabled={isSubmitting} type="submit" className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50">
                 {isSubmitting ? 'Submitting...' : <><Send size={18} /> Submit Request</>}
              </button>
           </div>
        </form>
      </Modal>

    </div>
  );
};

export default BookBrowser;