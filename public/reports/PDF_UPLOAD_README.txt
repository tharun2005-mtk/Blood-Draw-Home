
ADDITIONAL CHANGES MADE:
- Added multer and nodemailer to package.json dependencies.
- Added 'reportFile' field to Appointment model to store uploaded PDF filename.
- Update 'Update Test Result' view to allow uploading a PDF.
- PUT /lab/tests/:id/result now accepts a PDF upload (form field name: reportFile), saves it to public/reports, stores filename in appointment.reportFile, and attempts to email the PDF to the user if EMAIL_* env vars are set.

ENVIRONMENT VARIABLES (in .env):
- EMAIL_HOST (e.g., smtp.sendgrid.net)
- EMAIL_PORT (e.g., 587)
- EMAIL_SECURE (true/false)
- EMAIL_USER
- EMAIL_PASS
- EMAIL_FROM (optional, defaults to EMAIL_USER)

Uploaded PDFs are saved to public/reports and served at /reports/<filename>
