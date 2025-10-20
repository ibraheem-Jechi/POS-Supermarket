const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

// --------------------------
// Create new user (admin only)
// --------------------------
router.post('/create', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    const user = new User({ username, password, role });
    await user.save();

    res.status(201).json({
      message: 'User created',
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating user' });
  }
});

// --------------------------
// Login
// --------------------------
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    res.json({ id: user._id, username: user.username, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error logging in' });
  }
});

// --------------------------
// Get all users
// --------------------------
router.get('/all', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// --------------------------
// Update user (admin only)
// --------------------------
router.put('/:id', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.username = username || user.username;
    user.role = role || user.role;

    // only update password if provided
    if (password) user.password = password;

    await user.save();

    res.json({ message: 'User updated', user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating user' });
  }
});

// --------------------------
// Delete user (admin only)
// --------------------------
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting user' });
  }
});

module.exports = router;
