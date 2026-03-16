const db = require('../config/db');

exports.getAnnouncements = async (req, res) => {
  try {
    const [announcements] = await db.query(`
      SELECT a.announcement_id AS _id, a.title, a.message, a.created_at AS createdAt,
             u.full_name AS authorName, u.role AS authorRole
      FROM announcements a
      JOIN users u ON a.created_by = u.user_id
      ORDER BY a.created_at DESC
    `);
    const formatted = announcements.map(a => ({
       ...a,
       authorRole: a.authorRole.charAt(0).toUpperCase() + a.authorRole.slice(1)
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
       return res.status(400).json({ message: 'Please provide both title and message' });
    }
    const [result] = await db.query(
      'INSERT INTO announcements (title, message, created_by) VALUES (?, ?, ?)',
      [title, message, req.user.id]
    );
    res.status(201).json({
      _id: result.insertId, title, message, createdAt: new Date(),
      authorName: req.user.name,
      authorRole: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};