const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign(
        { id: user.user_id, role: user.role }, 
        process.env.JWT_SECRET || 'secret123', 
        { expiresIn: '30d' }
      );
      
      res.json({
        _id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// 2. Register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await db.query(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role ? role.toLowerCase() : 'student']
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Send OTP (API METHOD - No SMTP needed)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const [users] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60000); // 15 mins

    // Save to Database
    await db.query('UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?', [otp, expires, email]);

    // Send Email via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_KEY, // Use your Brevo API Key here
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { 
          name: "LibOrbit Support", 
          email: process.env.BREVO_USER // The email you verified in Brevo
        },
        to: [{ email: email }],
        subject: "Library Password Reset OTP",
        htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5;">LibOrbit Password Reset</h2>
            <p>Your OTP for resetting your password is:</p>
            <h1 style="letter-spacing: 5px; color: #1e293b;">${otp}</h1>
            <p style="color: #64748b;">This code will expire in 15 minutes.</p>
          </div>
        `
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Brevo API Error:", result);
      throw new Error(result.message || "Failed to send email via API");
    }

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error(`❌ [EMAIL ERROR]:`, error.message);
    res.status(500).json({ message: 'Error sending email: ' + error.message });
  }
};

// 4. Verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const [users] = await db.query('SELECT user_id FROM users WHERE email = ? AND reset_otp = ? AND reset_otp_expires > NOW()', [email, otp]);
    
    if (users.length === 0) return res.status(400).json({ message: 'Invalid or expired OTP' });
    
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// 5. Reset Password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const [users] = await db.query('SELECT user_id FROM users WHERE email = ? AND reset_otp = ? AND reset_otp_expires > NOW()', [email, otp]);
    if (users.length === 0) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE email = ?', 
      [hashedPassword, email]
    );

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};