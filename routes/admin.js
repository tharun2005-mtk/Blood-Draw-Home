// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const Test = require('../models/Test');
// const Appointment = require('../models/Appointment');
// const { isAuthenticated, isAdmin } = require('../middleware');

// // Admin dashboard
// // router.get('/dashboard', isAuthenticated, isAdmin, async (req, res) => {
// //   try {
// //     const usersCount = await User.countDocuments({ role: 'user' });
// //     const phlebotomistsCount = await User.countDocuments({ role: 'phlebotomist' });
// //     const labsCount = await User.countDocuments({ role: 'lab' });
// //     const testsCount = await Test.countDocuments();
// //     const appointmentsCount = await Appointment.countDocuments();
    
// //     const recentAppointments = await Appointment.find()
// //       .populate('user', 'name')
// //       .populate('tests', 'name')
// //       .sort({ createdAt: -1 })
// //       .limit(5);

// //     res.render('admin/dashboard', {
// //       title: 'Admin Dashboard',
// //       usersCount,
// //       phlebotomistsCount,
// //       labsCount,
// //       testsCount,
// //       appointmentsCount,
// //       recentAppointments
// //     });
// //   } catch (error) {
// //     console.error(error);
// //     req.flash('error_msg', 'Error loading dashboard');
// //     res.redirect('/admin/dashboard');
// //   }
// // });
// // In routes/admin.js - Fix the dashboard route
// router.get('/dashboard', isAuthenticated, isAdmin, async (req, res) => {
//   try {
//     const usersCount = await User.countDocuments({ role: 'user' });
//     const phlebotomistsCount = await User.countDocuments({ role: 'phlebotomist' });
//     const labsCount = await User.countDocuments({ role: 'lab' });
//     const testsCount = await Test.countDocuments();
//     const appointmentsCount = await Appointment.countDocuments();
    
//     const recentAppointments = await Appointment.find()
//       .populate('user', 'name')
//       .populate('tests', 'name')
//       .sort({ createdAt: -1 })
//       .limit(5);

//     res.render('admin/dashboard', {
//       title: 'Admin Dashboard',
//       usersCount,
//       phlebotomistsCount,
//       labsCount,
//       testsCount,
//       appointmentsCount,
//       recentAppointments
//     });
//   } catch (error) {
//     console.error('Dashboard error:', error);
//     req.flash('error_msg', 'Error loading dashboard');
//     res.redirect('/admin/dashboard');
//   }
// });
// // Manage users
// router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
//   try {
//     const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
//     res.render('admin/users', { title: 'Manage Users', users });
//   } catch (error) {
//     console.error(error);
//     req.flash('error_msg', 'Error loading users');
//     res.redirect('/admin/dashboard');
//   }
// });

// // Manage phlebotomists
// router.get('/phlebotomists', isAuthenticated, isAdmin, async (req, res) => {
//   try {
//     const phlebotomists = await User.find({ role: 'phlebotomist' }).sort({ createdAt: -1 });
//     res.render('admin/phlebotomists', { title: 'Manage Phlebotomists', phlebotomists });
//   } catch (error) {
//     console.error(error);
//     req.flash('error_msg', 'Error loading phlebotomists');
//     res.redirect('/admin/dashboard');
//   }
// });

// // Manage labs
// router.get('/labs', isAuthenticated, isAdmin, async (req, res) => {
//   try {
//     const labs = await User.find({ role: 'lab' }).sort({ createdAt: -1 });
//     res.render('admin/labs', { title: 'Manage Labs', labs });
//   } catch (error) {
//     console.error(error);
//     req.flash('error_msg', 'Error loading labs');
//     res.redirect('/admin/dashboard');
//   }
// });

// // Toggle user status
// router.put('/users/:id/toggle-status', isAuthenticated, isAdmin, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     user.isActive = !user.isActive;
//     await user.save();
    
//     req.flash('success_msg', `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
//     res.redirect('back');
//   } catch (error) {
//     console.error(error);
//     req.flash('error_msg', 'Error updating user status');
//     res.redirect('back');
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Test = require('../models/Test');
const Appointment = require('../models/Appointment');
const { isAuthenticated, isAdmin } = require('../middleware');

// ==========================
// Admin Dashboard
// ==========================
router.get('/dashboard', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const usersCount = await User.countDocuments({ role: 'user' });
    const phlebotomistsCount = await User.countDocuments({ role: 'phlebotomist' });
    const labsCount = await User.countDocuments({ role: 'lab' });
    const testsCount = await Test.countDocuments();
    const appointmentsCount = await Appointment.countDocuments();

    // ✅ FIX: populate 'tests' (array), not 'test'
    const recentAppointments = await Appointment.find()
      .populate('user', 'name')
      .populate('tests', 'name price') // ✅ correct path
      .populate('lab', 'name')
      .populate('phlebotomist', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      usersCount,
      phlebotomistsCount,
      labsCount,
      testsCount,
      appointmentsCount,
      recentAppointments
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error_msg', 'Error loading dashboard');
    //res.redirect('/admin/dashboard');
    return res.redirect('/login');
  }
});

// ==========================
// Manage Users
// ==========================
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.render('admin/users', { title: 'Manage Users', users });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading users');
    res.redirect('/admin/dashboard');
  }
});

// ==========================
// Manage Phlebotomists
// ==========================
router.get('/phlebotomists', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const phlebotomists = await User.find({ role: 'phlebotomist' }).sort({ createdAt: -1 });
    res.render('admin/phlebotomists', { title: 'Manage Phlebotomists', phlebotomists });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading phlebotomists');
    res.redirect('/admin/dashboard');
  }
});

// ==========================
// Manage Labs
// ==========================
router.get('/labs', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const labs = await User.find({ role: 'lab' }).sort({ createdAt: -1 });
    res.render('admin/labs', { title: 'Manage Labs', labs });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading labs');
    res.redirect('/admin/dashboard');
  }
});

// ==========================
// Toggle User Status
// ==========================
router.put('/users/:id/toggle-status', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('back');
    }

    user.isActive = !user.isActive;
    await user.save();

    req.flash('success_msg', `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
    res.redirect('back');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error updating user status');
    res.redirect('back');
  }
});

module.exports = router;
