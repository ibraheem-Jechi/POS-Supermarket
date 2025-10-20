const mongoose = require('mongoose');
const User = require('./models/userModel');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/supermarket_pos';

mongoose.connect(MONGO)
  .then(async () => {
    console.log('MongoDB connected');

    // Remove old admin
    await User.deleteMany({ username: 'Bob' });

    // Create new admin with hashed password
    const admin = new User({
      username: 'Bob',
      password: '12345678', // plaintext here, model will hash it
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin created:', admin);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
