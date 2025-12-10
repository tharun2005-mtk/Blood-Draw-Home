const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const { isAuthenticated, isLab } = require('../middleware');

// ========= Multer for PDF reports =========
const reportsDir = path.join(__dirname, '..', 'public', 'reports');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, reportsDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, Date.now() + '-' + safeName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ========= Nodemailer (optional) =========
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: process.env.EMAIL_USER
    ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    : undefined
});

// ==================================
// Lab Dashboard
// ==================================
router.get('/dashboard', isAuthenticated, isLab, async (req, res) => {
  try {
    const labId = req.session.user.id;
    console.log('Lab dashboard for labId =', labId);

    // Pending: sample collected but no result yet
    const pendingTests = await Appointment.find({
      lab: labId,
      sampleCollected: true,
      $or: [
        { result: { $exists: false } },
        { result: null },
        { result: '' }
      ]
    })
      .populate('user', 'name')
      .populate('tests', 'name')
      .populate('phlebotomist', 'name')
      .sort({ sampleCollectedAt: 1 })
      .lean();

    // Completed: has a non-null / non-empty result
    const completedTests = await Appointment.find({
      lab: labId,
      result: { $exists: true, $ne: null, $ne: '' }
    })
      .populate('user', 'name')
      .populate('tests', 'name')
      .sort({ resultDate: -1 })
      .limit(5)
      .lean();

    console.log('Pending tests count:', pendingTests.length);
    console.log('Completed tests count:', completedTests.length);

    res.render('lab/dashboard', {
      title: 'Lab Dashboard',
      pendingTests,
      completedTests
    });
  } catch (error) {
    console.error('Lab dashboard error:', error);
    req.flash('error_msg', 'Error loading dashboard');
    res.redirect('/lab/dashboard');
  }
});

// ==================================
// View all tests for this lab
// ==================================
router.get('/tests', isAuthenticated, isLab, async (req, res) => {
  try {
    const tests = await Appointment.find({ lab: req.session.user.id })
      .populate('user', 'name')
      .populate('tests', 'name')
      .populate('phlebotomist', 'name')
      .sort({ createdAt: -1 });

    res.render('lab/tests', { title: 'All Tests', tests });
  } catch (error) {
    console.error('Error loading tests:', error);
    req.flash('error_msg', 'Error loading tests');
    res.redirect('/lab/dashboard');
  }
});

// ==================================
// Show "Update Result" form
// ==================================
router.get('/tests/:id/result', isAuthenticated, isLab, async (req, res) => {
  try {
    const test = await Appointment.findById(req.params.id)
      .populate('user', 'name')
      .populate('tests', 'name');

    if (!test) {
      req.flash('error_msg', 'Test not found');
      return res.redirect('/lab/tests');
    }

    res.render('lab/update-result', {
      title: 'Update Test Result',
      test
    });
  } catch (error) {
    console.error('Error loading test for result update:', error);
    req.flash('error_msg', 'Error loading test');
    res.redirect('/lab/tests');
  }
});

// ==================================
// Shared handler for saving result
// ==================================
const handleResultUpdate = async (req, res) => {
  try {
    const { result, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate('user');

    if (!appointment) {
      req.flash('error_msg', 'Test not found');
      return res.redirect('/lab/tests');
    }

    appointment.result = result;
    appointment.notes = notes;
    appointment.resultDate = new Date();
    appointment.status = 'completed';

    if (req.file) {
      appointment.reportFile = req.file.filename;
    }

    await appointment.save();

    // Try emailing the PDF (if configured and user has email)
    if (req.file && transporter && process.env.EMAIL_USER) {
      try {
        const emailTo =
          appointment.user && appointment.user.email
            ? appointment.user.email
            : null;

        if (emailTo) {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: emailTo,
            subject: 'Your Lab Test Report',
            text: 'Please find attached your lab test report.',
            attachments: [
              {
                filename: req.file.originalname,
                path: path.join(reportsDir, req.file.filename),
                contentType: 'application/pdf'
              }
            ]
          });
          console.log('Email sent to', emailTo);
        }
      } catch (mailErr) {
        console.error('Error sending email:', mailErr);
      }
    }

    req.flash('success_msg', 'Test result updated successfully');
    res.redirect('/lab/dashboard');
  } catch (error) {
    console.error('Error updating test result:', error);
    req.flash('error_msg', 'Error updating test result');
    res.redirect('/lab/tests');
  }
};

// ==================================
// Save result + optional PDF upload
// Supports BOTH POST and PUT
// ==================================
router.post(
  '/tests/:id/result',
  isAuthenticated,
  isLab,
  upload.single('reportFile'),
  handleResultUpdate
);

router.put(
  '/tests/:id/result',
  isAuthenticated,
  isLab,
  upload.single('reportFile'),
  handleResultUpdate
);

module.exports = router;
