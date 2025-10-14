const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    const user = await User.create({ username, password, role });
    res.status(201).json({ 
      _id: user._id, 
      username: user.username, 
      role: user.role, 
      token: generateToken(user._id) 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ 
      _id: user._id, 
      username: user.username, 
      role: user.role, 
      token: generateToken(user._id) 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { registerUser, loginUser };
