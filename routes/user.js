// routes/user.js
const express = require('express');
const router = express.Router();

const Test = require('../models/Test');
const Lab = require('../models/Lab');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { isAuthenticated, isUser } = require('../middleware');

// ==========================
// User Dashboard
// ==========================
router.get('/dashboard', isAuthenticated, isUser, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const upcomingAppointments = await Appointment.find({
      user: userId,
      status: { $in: ['pending', 'scheduled'] }
    })
      .populate('tests', 'name price')
      .populate('lab', 'name')
      .populate('phlebotomist', 'name')
      .sort({ appointmentDate: 1 })
      .limit(5);

    const recentTests = await Appointment.find({
      user: userId,
      status: 'completed'
    })
      .populate('tests', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('user/dashboard', {
      title: 'User Dashboard',
      upcomingAppointments: upcomingAppointments || [],
      recentTests: recentTests || []
    });
  } catch (error) {
    console.error('User dashboard error:', error);
    req.flash('error_msg', 'Error loading dashboard');
    res.redirect('/');
  }
});

// ==========================
// Book Appointment (GET)
// ==========================
router.get('/appointments/book', isAuthenticated, isUser, async (req, res) => {
  try {
    const tests = await Test.find({ isActive: true });
    const labs = await Lab.find();

    res.render('user/book-appointment', {
      title: 'Book Appointment',
      tests,
      labs
    });
  } catch (error) {
    console.error('Error loading booking page:', error);
    req.flash('error_msg', 'Error loading booking page');
    res.redirect('/user/dashboard');
  }
});

// ==========================
// Book Appointment (POST)
// ==========================
router.post('/appointments', isAuthenticated, isUser, async (req, res) => {
  try {
    let { tests, labId, appointmentDate } = req.body;

    // Normalize tests to an array
    if (!Array.isArray(tests)) tests = tests ? [tests] : [];

    const dateObj = new Date(appointmentDate);
    const now = new Date();

    if (dateObj < now) {
      req.flash('error_msg', 'Appointment date cannot be in the past');
      return res.redirect('/user/appointments/book');
    }

    // Fetch selected tests for price calculation
    const selectedTests = await Test.find({ _id: { $in: tests } });

    const totalPrice = selectedTests.reduce(
      (sum, t) => sum + (parseFloat(t.price) || 0),
      0
    );

    const newAppointment = new Appointment({
      user: req.session.user.id,
      tests,
      lab: labId,
      appointmentDate: dateObj,
      totalPrice,
      status: 'pending'
    });

    await newAppointment.save();

    req.flash('success_msg', 'Appointment booked successfully');
    res.redirect('/user/appointments');
  } catch (error) {
    console.error('Error booking appointment:', error);
    req.flash('error_msg', 'Error booking appointment');
    res.redirect('/user/appointments/book');
  }
});

// ==========================
// View Appointments
// ==========================
router.get('/appointments', isAuthenticated, isUser, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      user: req.session.user.id
    })
      .populate('tests', 'name price')
      .populate('lab', 'name')
      .populate('phlebotomist', 'name')
      .sort({ appointmentDate: -1 });

    const formattedAppointments = appointments.map(app => {
      const totalPrice = Array.isArray(app.tests)
        ? app.tests.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0)
        : 0;

      return {
        ...app.toObject(),
        totalPrice: Number(totalPrice.toFixed(2))
      };
    });

    res.render('user/appointments', {
      title: 'My Appointments',
      appointments: formattedAppointments
    });
  } catch (error) {
    console.error('Error loading appointments:', error);
    req.flash('error_msg', 'Error loading appointments');
    res.redirect('/user/dashboard');
  }
});

// ==========================
// Test Results
// ==========================
// router.get('/test-results', isAuthenticated, isUser, async (req, res) => {
//   try {
//     const testResults = await Appointment.find({
//       user: req.session.user.id,
//       status: 'completed',
//       result: { $exists: true, $ne: null }
//     })
//       .populate('tests', 'name')
//       .populate('lab', 'name')
//       .sort({ resultDate: -1 })
//       .lean(); // plain JS objects

//     res.render('user/testResults', {
//       title: 'Test Results',
//       testResults: testResults || []     // 👈 this is the name EJS expects
//     });
//   } catch (error) {
//     console.error('Error loading test results:', error);
//     req.flash('error_msg', 'Error loading test results');
//     res.redirect('/user/dashboard');
//   }
// });

router.get('/test-results', isAuthenticated, isUser, async (req, res) => {
  try {
    const testResults = await Appointment.find({
      user: req.session.user.id,
      status: 'completed',
      result: { $exists: true, $ne: null }
    })
      .populate('tests', 'name')
      .populate('lab', 'name')
      .sort({ resultDate: -1 })
      .lean();

    res.render('user/testResults', {
      title: 'Test Results',
      testResults // 👈 FIXED
    });
  } catch (error) {
    console.error('Error loading test results:', error);
    req.flash('error_msg', 'Error loading test results');
    res.redirect('/user/dashboard');
  }
});


// ==========================
// User Profile
// ==========================
router.get('/profile', isAuthenticated, isUser, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.render('user/profile', { title: 'My Profile', user });
  } catch (error) {
    console.error('Error loading profile:', error);
    req.flash('error_msg', 'Error loading profile');
    res.redirect('/user/dashboard');
  }
});

module.exports = router;
