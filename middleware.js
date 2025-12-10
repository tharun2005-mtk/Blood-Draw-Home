// middleware.js
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error_msg', 'Please log in to access this page');
  return res.redirect('/login');
};

const isAdmin = (req, res, next) => {
  if (req.session?.user?.role === 'admin') return next();
  req.flash('error_msg', 'Access denied. Admin privileges required.');
  return res.redirect('/login');
};

const isUser = (req, res, next) => {
  if (req.session?.user?.role === 'user') return next();
  req.flash('error_msg', 'Access denied. User privileges required.');
  return res.redirect('/login');
};

const isPhlebotomist = (req, res, next) => {
  if (req.session?.user?.role === 'phlebotomist') return next();
  req.flash('error_msg', 'Access denied. Phlebotomist privileges required.');
  return res.redirect('/login');
};

const isLab = (req, res, next) => {
  if (req.session?.user?.role === 'lab') return next();
  req.flash('error_msg', 'Access denied. Lab privileges required.');
  return res.redirect('/login');
};

// Safe population helper
const safePopulate = async (model, query, populatePaths) => {
  try {
    let result = model.find(query);
    populatePaths.forEach(path => {
      result = result.populate(path);
    });
    return await result.exec();
  } catch (error) {
    console.error('Population error:', error);
    return [];
  }
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isUser,
  isPhlebotomist,
  isLab,
  safePopulate
};
