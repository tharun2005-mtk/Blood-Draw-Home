const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Test = require('../models/Test');
const PDFService = require('../services/pdfService');
const { isAuthenticated, isUser, isAdmin, isLab } = require('../middleware');

// Download test report for user
router.get('/test-report/:appointmentId', isAuthenticated, isUser, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId)
            .populate('user')
            .populate('tests')
            .populate('phlebotomist')
            .populate('lab');

        if (!appointment) {
            req.flash('error_msg', 'Appointment not found');
            return res.redirect('/user/test-results');
        }

        // Check if user owns this appointment
        if (appointment.user._id.toString() !== req.session.user.id) {
            req.flash('error_msg', 'Access denied');
            return res.redirect('/user/test-results');
        }

        // Check if results are available
        if (!appointment.result) {
            req.flash('error_msg', 'Test results are not available yet');
            return res.redirect('/user/test-results');
        }

        PDFService.generateTestReport(
            appointment,
            appointment.user,
            appointment.tests,
            appointment.phlebotomist,
            appointment.lab,
            (error, filePath) => {
                if (error) {
                    console.error('PDF generation error:', error);
                    req.flash('error_msg', 'Error generating report');
                    return res.redirect('/user/test-results');
                }

                res.download(`./public${filePath}`, `test_report_${appointment._id}.pdf`, (err) => {
                    if (err) {
                        console.error('Download error:', err);
                        req.flash('error_msg', 'Error downloading report');
                        res.redirect('/user/test-results');
                    }
                });
            }
        );

    } catch (error) {
        console.error('Report error:', error);
        req.flash('error_msg', 'Error generating report');
        res.redirect('/user/test-results');
    }
});

// Generate appointments report for admin
router.get('/appointments', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        
        let filter = {};
        
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        if (startDate && endDate) {
            filter.appointmentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const appointments = await Appointment.find(filter)
            .populate('user', 'name')
            .populate('tests', 'name')
            .sort({ appointmentDate: -1 });

        const filters = { status };

        PDFService.generateAppointmentsReport(appointments, filters, (error, filePath) => {
            if (error) {
                console.error('PDF generation error:', error);
                req.flash('error_msg', 'Error generating report');
                return res.redirect('/admin/dashboard');
            }

            res.download(`./public${filePath}`, `appointments_report_${Date.now()}.pdf`, (err) => {
                if (err) {
                    console.error('Download error:', err);
                    req.flash('error_msg', 'Error downloading report');
                    res.redirect('/admin/dashboard');
                }
            });
        });

    } catch (error) {
        console.error('Appointments report error:', error);
        req.flash('error_msg', 'Error generating appointments report');
        res.redirect('/admin/dashboard');
    }
});

// Lab report for completed tests
router.get('/lab-report', isAuthenticated, isLab, async (req, res) => {
    try {
        const labId = req.session.user.id;
        
        const completedTests = await Appointment.find({
            lab: labId,
            status: 'completed',
            result: { $exists: true }
        })
        .populate('user', 'name')
        .populate('tests', 'name')
        .populate('phlebotomist', 'name')
        .sort({ resultDate: -1 });

        PDFService.generateAppointmentsReport(completedTests, { status: 'completed' }, (error, filePath) => {
            if (error) {
                console.error('PDF generation error:', error);
                req.flash('error_msg', 'Error generating lab report');
                return res.redirect('/lab/dashboard');
            }

            res.download(`./public${filePath}`, `lab_report_${Date.now()}.pdf`, (err) => {
                if (err) {
                    console.error('Download error:', err);
                    req.flash('error_msg', 'Error downloading lab report');
                    res.redirect('/lab/dashboard');
                }
            });
        });

    } catch (error) {
        console.error('Lab report error:', error);
        req.flash('error_msg', 'Error generating lab report');
        res.redirect('/lab/dashboard');
    }
});

module.exports = router;