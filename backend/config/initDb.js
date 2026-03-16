const db = require('../config/db');

// Database initialization
const initDB = async () => {
    try {
        console.log("Checking MySQL Database Schema...");
        
        // Ensure default admin exists
        const [admins] = await db.query('SELECT * FROM users WHERE email = ?', ['admin@autolib.ai']);
        if (admins.length === 0) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            await db.query(
                'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
                ['System Admin', 'admin@autolib.ai', hashedPassword, 'admin']
            );
            console.log("🔒 Default Admin account created (admin@autolib.ai / admin123)");
        } else {
             console.log("🔒 Access Database Verified. System Ready.");
        }

        // Add roll_no and department to existing users table
        try {
            await db.query('ALTER TABLE users ADD COLUMN roll_no VARCHAR(100) DEFAULT NULL');
            console.log("✅ Added roll_no column to users table.");
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error("Error adding roll_no:", e.message);
        }
        try {
            await db.query('ALTER TABLE users ADD COLUMN department VARCHAR(255) DEFAULT NULL');
            console.log("✅ Added department column to users table.");
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error("Error adding department:", e.message);
        }

        // Ensure announcements table exists
        await db.query(`
          CREATE TABLE IF NOT EXISTS announcements (
            announcement_id INT AUTO_INCREMENT PRIMARY KEY, 
            title VARCHAR(255) NOT NULL, 
            message TEXT NOT NULL, 
            created_by INT NOT NULL,  
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
            FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
          )
        `);
        console.log("📢 Announcements table ready.");

        // Ensure book_requests table exists
        await db.query(`
          CREATE TABLE IF NOT EXISTS book_requests (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            book_id INT NOT NULL, 
            user_id INT NOT NULL, 
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending', 
            request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
            FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
          )
        `);
        console.log("📚 Book Requests table ready.");

        // Ensure custom_book_requests table exists
        await db.query(`
          CREATE TABLE IF NOT EXISTS custom_book_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            edition VARCHAR(100),
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
          )
        `);
        console.log("📝 Custom Book Requests table ready.");


    } catch (error) {
        console.error("❌ Failed to initialize database:", error.message);
    }
};

module.exports = { initDB };
