const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./config/initDb');

dotenv.config();

const app = express();

// --- UPDATED CORS MIDDLEWARE ---
// This tells Render to accept requests from your Vercel frontend
app.use(cors({
  origin: [
    'https://liborbit.vercel.app', // Your live Vercel frontend
    'http://localhost:5173',       // Local Vite frontend
    'http://localhost:3000'        // Local Create React App (just in case)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Important if you use secure cookies or tokens
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/books', require('./routes/books'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/fines', require('./routes/fines'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;

// Initialize Database then start Server
const startServer = async () => {
   await initDB();
   app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
   });
};

startServer();