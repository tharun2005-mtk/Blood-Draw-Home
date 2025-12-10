require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

// ------------------------------------
// 🔗 MongoDB Connection
// ------------------------------------
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bl', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ------------------------------------
// 🧩 Core Middleware
// ------------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// ------------------------------------
// 💾 Session & Flash Configuration
// ------------------------------------
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user || null;
  next();
});

// ------------------------------------
// 🎨 EJS Layout Setup
// ------------------------------------
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/boilerplate');

// ------------------------------------
// 🛣️ Routes Setup
// ------------------------------------
app.use('/', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/user', require('./routes/user'));
app.use('/phlebotomist', require('./routes/phlebotomist'));
app.use('/lab', require('./routes/lab'));
app.use('/reports', require('./routes/reports')); // ✅ placed AFTER session middleware

// Serve static PDF files from /public/reports
app.use('/reports', express.static(path.join(__dirname, 'public/reports')));

// ------------------------------------
// 🏠 Home Route
// ------------------------------------
app.get('/', (req, res) => {
  res.render('index', { title: 'Blood Test Management System' });
});

// ------------------------------------
// 🚫 404 Handler
// ------------------------------------
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// ------------------------------------
// 🚀 Start Server
// ------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
