// const express = require('express');
// const router = express.Router();
// const Appointment = require('../models/Appointment');
// const User = require('../models/User');
// const { isAuthenticated, isPhlebotomist } = require('../middleware');

// // ============================
// // Phlebotomist Dashboard
// // ============================
// router.get('/dashboard', isAuthenticated, isPhlebotomist, async (req, res) => {
//     try {
//         const phlebotomistId = req.session.user.id;

//         // Today range
//         const startOfDay = new Date();
//         startOfDay.setHours(0, 0, 0, 0);

//         const endOfDay = new Date();
//         endOfDay.setHours(23, 59, 59, 999);

//         // Appointments assigned to this phlebotomist for today
//         const todayAppointments = await Appointment.find({
//             phlebotomist: phlebotomistId,
//             appointmentDate: { $gte: startOfDay, $lt: endOfDay },
//             status: 'scheduled'
//         })
//             .populate('user', 'name phone bloodGroup')
//             .populate('tests', 'name')
//             .sort({ appointmentDate: 1 });

//         // Unassigned pending appointments
//         const pendingAppointments = await Appointment.find({
//             status: 'pending',
//             phlebotomist: { $exists: false }
//         })
//             .populate('user', 'name')
//             .populate('tests', 'name')
//             .sort({ appointmentDate: 1 })
//             .limit(5);

//         res.render('phlebotomist/dashboard', {
//             title: 'Phlebotomist Dashboard',
//             todayAppointments,
//             pendingAppointments
//         });
//     } catch (error) {
//         console.error('Dashboard error:', error);
//         req.flash('error_msg', 'Error loading dashboard');
//         res.redirect('/phlebotomist/dashboard');
//     }
// });

// // ============================
// // Accept Appointment (from dashboard)
// // ============================
// router.post('/accept-appointment', isAuthenticated, isPhlebotomist, async (req, res) => {
//     try {
//         const { appointmentId } = req.body;
//         const appointment = await Appointment.findById(appointmentId);

//         if (!appointment) {
//             req.flash('error_msg', 'Appointment not found');
//             return res.redirect('/phlebotomist/dashboard');
//         }

//         appointment.phlebotomist = req.session.user.id;
//         appointment.status = 'scheduled';
//         await appointment.save();

//         req.flash('success_msg', 'Appointment accepted successfully');
//         res.redirect('/phlebotomist/dashboard');
//     } catch (error) {
//         console.error('Error accepting appointment:', error);
//         req.flash('error_msg', 'Error accepting appointment');
//         res.redirect('/phlebotomist/dashboard');
//     }
// });

// // ============================
// // Collect Sample (from dashboard OR My Appointments)
// // POST /phlebotomist/collect-sample
// // ============================
// // router.post('/collect-sample', isAuthenticated, isPhlebotomist, async (req, res) => {
// //     try {
// //         const { appointmentId } = req.body;
// //         const appointment = await Appointment.findById(appointmentId);

// //         if (!appointment) {
// //             req.flash('error_msg', 'Appointment not found');
// //             return res.redirect('/phlebotomist/dashboard');
// //         }

// //         // Ensure this phlebotomist owns the appointment
// //         if (appointment.phlebotomist.toString() !== req.session.user.id) {
// //             req.flash('error_msg', 'You are not assigned to this appointment');
// //             return res.redirect('/phlebotomist/dashboard');
// //         }

// //         // Mark sample collected
// //         appointment.sampleCollected = true;
// //         appointment.sampleCollectedAt = new Date();
// //         appointment.status = 'in_lab'; 
// //         // Assign to a lab if not already assigned
// //         if (!appointment.lab) {
// //             const labs = await User.find({ role: 'lab', isActive: true });
// //             if (labs.length > 0) {
// //                 appointment.lab = labs[0]._id; // Assign to first available lab
// //             }
// //         }

// //         await appointment.save();

// //         req.flash('success_msg', 'Sample collected successfully and sent to lab');
// //         // after collect, both dashboard and My Appointments will show updated status
// //         res.redirect('/phlebotomist/appointments');
// //     } catch (error) {
// //         console.error('Error collecting sample:', error);
// //         req.flash('error_msg', 'Error updating sample status');
// //         res.redirect('/phlebotomist/appointments');
// //     }
// // });


// router.post('/collect-sample', isAuthenticated, isPhlebotomist, async (req, res) => { 
//     try {
//         const { appointmentId } = req.body;
//         const appointment = await Appointment.findById(appointmentId);

//         if (!appointment) {
//             req.flash('error_msg', 'Appointment not found');
//             return res.redirect('/phlebotomist/dashboard');
//         }

//         // Ensure this phlebotomist owns the appointment
//         if (appointment.phlebotomist.toString() !== req.session.user.id) {
//             req.flash('error_msg', 'You are not assigned to this appointment');
//             return res.redirect('/phlebotomist/dashboard');
//         }

//         // Mark sample collected
//         appointment.sampleCollected = true;
//         appointment.sampleCollectedAt = new Date();
//         appointment.status = 'in_lab';   // ✅ lab can now treat this as pending

//         // ✅ Assign to a lab (without isActive filter)
//         if (!appointment.lab) {
//             const labs = await User.find({ role: 'lab' }).sort({ createdAt: 1 });
//             if (labs.length > 0) {
//                 appointment.lab = labs[0]._id; // e.g. City Central Laboratory
//             }
//         }

//         await appointment.save();

//         // req.flash('success_msg', 'Sample collected successfully and sent to lab');
//         // res.redirect('/phlebotomist/appointments');
//         req.flash('success_msg', 'Sample collected successfully and sent to lab');
// res.redirect('/phlebotomist/appointments');

//     } catch (error) {
//         console.error('Error collecting sample:', error);
//         req.flash('error_msg', 'Error updating sample status');
//         res.redirect('/phlebotomist/appointments');
//     }
// });


// // ============================
// // View All Appointments (table)
// // ============================
// router.get('/appointments', isAuthenticated, isPhlebotomist, async (req, res) => {
//     try {
//         const appointments = await Appointment.find({ phlebotomist: req.session.user.id })
//             .populate('user', 'name phone address bloodGroup')
//             .populate('tests', 'name')
//             .sort({ appointmentDate: -1 });

//         res.render('phlebotomist/appointments', {
//             title: 'My Appointments',
//             appointments
//         });
//     } catch (error) {
//         console.error('Error loading appointments:', error);
//         req.flash('error_msg', 'Error loading appointments');
//         res.redirect('/phlebotomist/dashboard');
//     }
// });

// // Optional test route
// router.get('/test', isAuthenticated, isPhlebotomist, (req, res) => {
//     res.send('Phlebotomist routes are working!');
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { isAuthenticated, isPhlebotomist } = require('../middleware');

// ==========================
// Phlebotomist Dashboard
// ==========================
router.get('/dashboard', isAuthenticated, isPhlebotomist, async (req, res) => {
  try {
    const phlebotomistId = req.session.user.id;

    // Today range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // const todayAppointments = await Appointment.find({
    //   phlebotomist: phlebotomistId,
    //   appointmentDate: { $gte: startOfDay, $lt: endOfDay },
    //   status: { $in: ['scheduled', 'in_lab'] }
    // })
    const todayAppointments = await Appointment.find({
  phlebotomist: phlebotomistId,
  appointmentDate: { $gte: startOfDay, $lt: endOfDay },
  status: 'scheduled'
})

      .populate('user', 'name phone bloodGroup')
      .populate('tests', 'name')
      .sort({ appointmentDate: 1 });

    // appointments that have no phlebotomist yet
    const pendingAppointments = await Appointment.find({
      status: 'pending',
      phlebotomist: { $exists: false }
    })
      .populate('user', 'name')
      .populate('tests', 'name')
      .sort({ appointmentDate: 1 })
      .limit(5);

    res.render('phlebotomist/dashboard', {
      title: 'Phlebotomist Dashboard',
      todayAppointments,
      pendingAppointments
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error_msg', 'Error loading dashboard');
    return res.redirect('/phlebotomist/dashboard');
  }
});

// ==========================
// Accept appointment (from dashboard)
// ==========================
router.post('/accept-appointment', isAuthenticated, isPhlebotomist, async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      req.flash('error_msg', 'Appointment not found');
      return res.redirect('/phlebotomist/dashboard');
    }

    appointment.phlebotomist = req.session.user.id;
    appointment.status = 'scheduled';
    await appointment.save();

    req.flash('success_msg', 'Appointment accepted successfully');
    res.redirect('/phlebotomist/dashboard');
  } catch (error) {
    console.error('Error accepting appointment:', error);
    req.flash('error_msg', 'Error accepting appointment');
    res.redirect('/phlebotomist/dashboard');
  }
});

// ==========================
// Collect sample (used by BOTH dashboard & appointments page)
// ==========================
// router.post('/collect-sample', isAuthenticated, isPhlebotomist, async (req, res) => {
//   try {
//     const { appointmentId } = req.body;
//     const appointment = await Appointment.findById(appointmentId);

//     if (!appointment) {
//       req.flash('error_msg', 'Appointment not found');
//       return res.redirect('/phlebotomist/appointments');
//     }

//     // Safely check assigned phlebotomist
//     if (
//       appointment.phlebotomist &&
//       appointment.phlebotomist.toString &&
//       appointment.phlebotomist.toString() !== req.session.user.id
//     ) {
//       req.flash('error_msg', 'You are not assigned to this appointment');
//       return res.redirect('/phlebotomist/appointments');
//     }

//     // if somehow phlebotomist is not set, assign it now
//     if (!appointment.phlebotomist) {
//       appointment.phlebotomist = req.session.user.id;
//     }

//     appointment.sampleCollected = true;
//     appointment.sampleCollectedAt = new Date();
//     appointment.status = 'in_lab';

//     // Assign to a lab if not already assigned
//     if (!appointment.lab) {
//       const labs = await User.find({ role: 'lab', isActive: true }).sort({ createdAt: 1 });
//       if (labs.length > 0) {
//         appointment.lab = labs[0]._id;
//       }
//     }

//     await appointment.save();

//     req.flash('success_msg', 'Sample collected successfully and sent to lab');
//     res.redirect('/phlebotomist/appointments');
//   } catch (error) {
//     console.error('Error collecting sample:', error);
//     req.flash('error_msg', 'Error updating sample status');
//     res.redirect('/phlebotomist/appointments');
//   }
// });

router.post('/collect-sample', isAuthenticated, isPhlebotomist, async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      req.flash('error_msg', 'No appointmentId provided');
      return res.redirect('back');
    }

    // Load appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      req.flash('error_msg', 'Appointment not found');
      return res.redirect('back');
    }

    // Always assign this phlebotomist (simpler & safe)
    appointment.phlebotomist = req.session.user.id;

    // Mark sample collected
    appointment.sampleCollected = true;
    appointment.sampleCollectedAt = new Date();
    // appointment.status = 'in_lab';
    appointment.status = 'scheduled';   // keep status legal; just mark sampleCollected = true


    // Make sure there is some lab assigned
    if (!appointment.lab) {
      const lab = await User.findOne({ role: 'lab' });   // no isActive filter, very forgiving
      if (lab) {
        appointment.lab = lab._id;
      }
    }

    await appointment.save();

    req.flash('success_msg', 'Sample collected successfully and sent to lab');
    return res.redirect('/phlebotomist/appointments');
  } catch (error) {
    console.error('Error collecting sample:', error);
    // Show the real error text in the UI so we can see it if anything is still wrong
    req.flash('error_msg', 'Error updating sample status: ' + error.message);
    return res.redirect('back');
  }
});


// ==========================
// View all appointments for this phlebotomist
// ==========================
router.get('/appointments', isAuthenticated, isPhlebotomist, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      phlebotomist: req.session.user.id
    })
      .populate('user', 'name phone address bloodGroup')
      .populate('tests', 'name')
      .sort({ appointmentDate: -1 });

    res.render('phlebotomist/appointments', {
      title: 'My Appointments',
      appointments
    });
  } catch (error) {
    console.error('Error loading appointments:', error);
    req.flash('error_msg', 'Error loading appointments');
    res.redirect('/phlebotomist/dashboard');
  }
});

// Simple test route
router.get('/test', isAuthenticated, isPhlebotomist, (req, res) => {
  res.send('Phlebotomist routes are working!');
});

module.exports = router;
