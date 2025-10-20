const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

// --------------------------
// Create new user
// --------------------------
router.post('/create', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    const user = new User({ username, password, role }); // plain-text
    await user.save();

    res.status(201).json({
      message: 'User created',
      user: { username: user.username, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------
// Login
// --------------------------
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    res.json({ username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------
// Get all users (admin only)
// --------------------------
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------
// Update user
// --------------------------
router.put('/users/:id', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, password, role },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------
// Delete user
// --------------------------
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
