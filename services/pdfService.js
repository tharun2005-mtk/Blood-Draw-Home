const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
    /**
     * Generate a single test report for an appointment.
     * `testOrTests` can be:
     *  - a single Test object
     *  - an array of Test objects (appointment.tests)
     */
    static generateTestReport(appointment, user, testOrTests, phlebotomist, lab, callback) {
        const doc = new PDFDocument();
        const filename = `test_report_${appointment._id}_${Date.now()}.pdf`;
        const reportsDir = path.join(__dirname, '../public/reports/');
        const filePath = path.join(reportsDir, filename);

        // Ensure reports directory exists
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Add content to PDF
        this.addHeader(doc, appointment);
        this.addPatientInfo(doc, user);
        this.addTestDetails(doc, testOrTests, appointment);
        this.addMedicalInfo(doc, appointment, phlebotomist, lab);
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
            callback(null, `/reports/${filename}`);
        });

        stream.on('error', (error) => {
            callback(error, null);
        });
    }

    static addHeader(doc, appointment) {
        // Title
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .fillColor('#2c3e50')
           .text('BLOOD TEST REPORT', 50, 50, { align: 'center' });

        // Subtitle
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#7f8c8d')
           .text('Confidential Medical Document', 50, 80, { align: 'center' });

        // Report ID and Date
        doc.fontSize(10)
           .text(`Report ID: ${appointment._id}`, 50, 110)
           .text(`Generated: ${new Date().toLocaleDateString()}`, 400, 110);

        // Separator line
        doc.moveTo(50, 130)
           .lineTo(550, 130)
           .strokeColor('#bdc3c7')
           .lineWidth(1)
           .stroke();

        doc.y = 150;
    }

    static addPatientInfo(doc, user) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#2c3e50')
           .text('PATIENT INFORMATION', 50, doc.y);

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#34495e');

        const patientInfo = [
            `Name: ${user.name}`,
            `Email: ${user.email}`,
            `Phone: ${user.phone}`,
            user.address ? `Address: ${user.address}` : null,
            user.dateOfBirth ? `Date of Birth: ${new Date(user.dateOfBirth).toLocaleDateString()}` : null,
            user.bloodGroup ? `Blood Group: ${user.bloodGroup}` : null
        ].filter(Boolean);

        patientInfo.forEach((info, index) => {
            doc.text(info, 50, doc.y + 20 + (index * 15));
        });

        doc.y += 20 + (patientInfo.length * 15) + 20;
    }

    /**
     * Accepts either a single test object or an array of tests.
     */
    static addTestDetails(doc, testOrTests, appointment) {
        // Normalise to an array
        const tests = Array.isArray(testOrTests)
            ? testOrTests
            : (testOrTests ? [testOrTests] : []);

        const testNames = tests.length
            ? tests.map(t => t.name).join(', ')
            : 'N/A';

        const testDescriptions = tests
            .map(t => t.description)
            .filter(Boolean)
            .join('; ');

        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#2c3e50')
           .text('TEST DETAILS', 50, doc.y);

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#34495e');

        const testDetails = [
            `Test Name(s): ${testNames}`,
            `Description(s): ${testDescriptions || 'N/A'}`,
            `Appointment Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}`,
            `Sample Collected: ${
                appointment.sampleCollected
                    ? (appointment.sampleCollectedAt
                        ? new Date(appointment.sampleCollectedAt).toLocaleDateString()
                        : 'Yes')
                    : 'Not Collected'
            }`,
            `Report Date: ${
                appointment.resultDate
                    ? new Date(appointment.resultDate).toLocaleDateString()
                    : 'Pending'
            }`
        ];

        testDetails.forEach((detail, index) => {
            doc.text(detail, 50, doc.y + 20 + (index * 15));
        });

        doc.y += 20 + (testDetails.length * 15) + 20;
    }

    static addMedicalInfo(doc, appointment, phlebotomist, lab) {
        // Test Results Section
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#2c3e50')
           .text('TEST RESULTS', 50, doc.y);

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#34495e');

        if (appointment.result) {
            doc.text('Result:', 50, doc.y + 20)
               .font('Helvetica-Bold')
               .fillColor(appointment.status === 'completed' ? '#27ae60' : '#e74c3c')
               .text(appointment.result, 100, doc.y + 20);

            doc.font('Helvetica')
               .fillColor('#34495e');

            if (appointment.notes) {
                doc.text('Clinical Notes:', 50, doc.y + 40)
                   .text(appointment.notes, 50, doc.y + 55, { 
                       width: 500,
                       align: 'justify'
                   });
            }
        } else {
            doc.text('Status: Pending Results', 50, doc.y + 20)
               .fillColor('#f39c12');
        }

        doc.y += 100;

        // Medical Personnel Section
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#2c3e50')
           .text('MEDICAL PERSONNEL', 50, doc.y);

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#34495e');

        const personnel = [];
        if (phlebotomist) {
            personnel.push(`Phlebotomist: ${phlebotomist.name}`);
            if (phlebotomist.licenseNumber) {
                personnel.push(`License: ${phlebotomist.licenseNumber}`);
            }
        }
        if (lab) {
            personnel.push(`Laboratory: ${lab.name}`);
            if (lab.licenseNumber) {
                personnel.push(`Lab License: ${lab.licenseNumber}`);
            }
        }

        personnel.forEach((info, index) => {
            doc.text(info, 50, doc.y + 20 + (index * 15));
        });

        doc.y += 20 + (personnel.length * 15) + 20;
    }

    static addFooter(doc) {
        const footerY = 750;

        doc.moveTo(50, footerY - 20)
           .lineTo(550, footerY - 20)
           .strokeColor('#bdc3c7')
           .lineWidth(0.5)
           .stroke();

        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#7f8c8d')
           .text(
               'This is an electronically generated report. No signature is required.',
               50,
               footerY,
               { align: 'center', width: 500 }
           )
           .text(
               'For any queries, please contact the laboratory directly.',
               50,
               footerY + 12,
               { align: 'center', width: 500 }
           )
           .text(`Page ${doc.page.number}`, 50, footerY + 24, { align: 'center' });
    }

    /**
     * Generate a summary report of many appointments.
     * Uses appointment.tests (array) if present, otherwise falls back to appointment.test.
     */
    static generateAppointmentsReport(appointments, filters = {}, callback) {
        const doc = new PDFDocument();
        const filename = `appointments_report_${Date.now()}.pdf`;
        const reportsDir = path.join(__dirname, '../public/reports/');
        const filePath = path.join(reportsDir, filename);

        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .fillColor('#2c3e50')
           .text('APPOINTMENTS REPORT', 50, 50, { align: 'center' });

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#7f8c8d')
           .text(`Generated: ${new Date().toLocaleDateString()}`, 50, 80)
           .text(`Total Appointments: ${appointments.length}`, 400, 80);

        if (filters.status) {
            doc.text(`Filter: ${filters.status} appointments`, 50, 95);
        }

        // Table Header
        let yPosition = 120;
        const tableHeaders = ['Patient', 'Test(s)', 'Date', 'Status', 'Sample'];
        const columnWidths = [120, 120, 80, 80, 60];

        doc.font('Helvetica-Bold')
           .fillColor('#2c3e50');

        tableHeaders.forEach((header, index) => {
            const xPosition =
                50 + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
            doc.text(header, xPosition, yPosition, { width: columnWidths[index] });
        });

        yPosition += 20;

        // Table Rows
        doc.font('Helvetica')
           .fillColor('#34495e')
           .fontSize(8);

        appointments.forEach((appointment) => {
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
            }

            const testsArray = Array.isArray(appointment.tests)
                ? appointment.tests
                : (appointment.test ? [appointment.test] : []);

            const testNames = testsArray.length
                ? testsArray.map(t => t.name).join(', ')
                : 'N/A';

            const rowData = [
                appointment.user?.name || 'N/A',
                testNames,
                new Date(appointment.appointmentDate).toLocaleDateString(),
                appointment.status,
                appointment.sampleCollected ? 'Yes' : 'No'
            ];

            rowData.forEach((data, colIndex) => {
                const xPosition =
                    50 + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
                doc.text(data, xPosition, yPosition, {
                    width: columnWidths[colIndex],
                    lineBreak: false
                });
            });

            yPosition += 15;
        });

        doc.end();

        stream.on('finish', () => {
            callback(null, `/reports/${filename}`);
        });

        stream.on('error', (error) => {
            callback(error, null);
        });
    }
}

module.exports = PDFService;
