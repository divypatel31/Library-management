const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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

// 3. Send OTP
// 3. Send OTP
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(`[OTP Tracker] 1. Request received for email: ${email}`);
  
  try {
    const [users] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      console.log(`[OTP Tracker] 2. User not found in DB`);
      return res.status(404).json({ message: 'User with this email does not exist' });
    }
    console.log(`[OTP Tracker] 2. User found in DB`);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60000); // 15 mins

    // Try saving to Database
    console.log(`[OTP Tracker] 3. Attempting to save OTP to database...`);
    await db.query('UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?', [otp, expires, email]);
    console.log(`[OTP Tracker] 4. Successfully saved OTP to database.`);

    // Try sending Email
    console.log(`[OTP Tracker] 5. Attempting to send email via Nodemailer...`);
    console.log(`[OTP Tracker] Email User configured as: ${process.env.EMAIL_USER}`); // This should NOT be undefined
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
      }
    });

    await transporter.sendMail({
      from: '"LibOrbit" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'Library Password Reset OTP',
      text: `Your password reset OTP is: ${otp}. It will expire in 15 minutes.`
    });
    console.log(`[OTP Tracker] 6. Email sent successfully!`);

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error(`\n❌ [CRITICAL ERROR in forgotPassword]:`, error.message);
    console.error(`❌ [FULL ERROR STACK]:`, error);
    res.status(500).json({ message: 'Server error: ' + error.message });
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

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP
    await db.query(
      'UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE email = ?', 
      [hashedPassword, email]
    );

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};