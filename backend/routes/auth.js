const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const dotenv = require('dotenv');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(password);
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
console.log(hashedPassword);
    // Create a new user with additional fields
    user = new User({
      username,
      email,
      password:hashedPassword,
      profilePic: req.body.profilePic || 'default_profile_pic_url',
      posts: [],
      followers: [],
      following: []
    });

    // Save the user to the database
    await user.save();

    // Create a JWT payload
    const payload = { user: { id: user.id } };

    // Sign the JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with the token and user data
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        posts: user.posts,
        followers: user.followers,
        following: user.following
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login a user
/*router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("email:", email, "password:", password);

    // Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ msg: 'Invalid credentials due to user email' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ msg: 'Invalid credentials due to password' });
    }

    console.log("Password matched");

    // Create a JWT payload
    const payload = { user: { id: user.id } };

    // Sign the JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with the token and user data
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        posts: user.posts,
        followers: user.followers,
        following: user.following
      }
    });
  } catch (err) {
    console.error("error in login", err.message);
    res.status(500).send('Server error');
  }
});
*/
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Email:', email, 'Password:', password);

    // Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials due to user email' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials due to password' });
    }

    // Proceed with JWT token creation if passwords match
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        posts: user.posts,
        followers: user.followers,
        following: user.following,
      }
    });
  } catch (err) {
    console.error("error in login ", err.message);
    res.status(500).send('Server error');
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
