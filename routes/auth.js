const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated } = require('../middleware');

// Login page
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect(`/${req.session.user.role}/dashboard`);
  }
  res.render('auth/login', { title: 'Login' });
});

// // Login handler
// router.post('/login', async (req, res) => {
//   const { email, password, role } = req.body;
  
//   try {
//     const user = await User.findOne({ email, role, isActive: true });
//     if (!user) {
//       req.flash('error_msg', 'Invalid credentials or user not found');
//       return res.redirect('/login');
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       req.flash('error_msg', 'Invalid password');
//       return res.redirect('/login');
//     }

//     req.session.user = {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role
//     };

//     req.flash('success_msg', `Welcome back, ${user.name}!`);
//     res.redirect(`/${user.role}/dashboard`);
//   } catch (error) {
//     console.error(error);
//     req.flash('error_msg', 'Server error');
//     res.redirect('/login');
//   }
// });

// In routes/auth.js - Fix the login handler
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  
  try {
    console.log('Login attempt:', { email, role }); // Debug log
    
    const user = await User.findOne({ email, role, isActive: true });
    
    if (!user) {
      console.log('User not found or inactive'); // Debug log
      req.flash('error_msg', 'Invalid credentials or user not found');
      return res.redirect('/login');
    }

    console.log('User found:', user.name); // Debug log
    
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch); // Debug log
    
    if (!isMatch) {
      req.flash('error_msg', 'Invalid password');
      return res.redirect('/login');
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success_msg', `Welcome back, ${user.name}!`);
    res.redirect(`/${user.role}/dashboard`);
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error_msg', 'Server error during login');
    res.redirect('/login');
  }
});
// Register page
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register as User' });
});

// Register handler
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword, phone, address, dateOfBirth, bloodGroup } = req.body;
  
  if (password !== confirmPassword) {
    req.flash('error_msg', 'Passwords do not match');
    return res.redirect('/register');
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error_msg', 'User already exists with this email');
      return res.redirect('/register');
    }

    const newUser = new User({
      name,
      email,
      password,
      role: 'user',
      phone,
      address,
      dateOfBirth,
      bloodGroup
    });

    await newUser.save();
    req.flash('success_msg', 'Registration successful. Please log in.');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server error during registration');
    res.redirect('/register');
  }
});

// Register phlebotomist page
router.get('/register-phlebotomist', (req, res) => {
  res.render('auth/register-phlebotomist', { title: 'Register as Phlebotomist' });
});

// Register phlebotomist handler
router.post('/register-phlebotomist', async (req, res) => {
  const { name, email, password, confirmPassword, phone, specialization, licenseNumber } = req.body;
  
  if (password !== confirmPassword) {
    req.flash('error_msg', 'Passwords do not match');
    return res.redirect('/register-phlebotomist');
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error_msg', 'User already exists with this email');
      return res.redirect('/register-phlebotomist');
    }

    const newUser = new User({
      name,
      email,
      password,
      role: 'phlebotomist',
      phone,
      specialization,
      licenseNumber
    });

    await newUser.save();
    req.flash('success_msg', 'Registration successful. Please wait for admin approval.');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server error during registration');
    res.redirect('/register-phlebotomist');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;