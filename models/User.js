// // User.js
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   role: {
//     type: String,
//     enum: ['admin', 'user', 'phlebotomist', 'lab'],
//     required: true
//   },
//   phone: {
//     type: String
//   },
//   address: {
//     type: String
//   },
//   dateOfBirth: {
//     type: Date
//   },
//   bloodGroup: {
//     type: String
//   },
//   specialization: { // For phlebotomists
//     type: String
//   },
//   licenseNumber: { // For phlebotomists and labs
//     type: String
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// // Compare password method
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);
// models/User.js - UPDATED with unique phone validation
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Basic phone validation - adjust regex based on your requirements
        return /^[0-9]{10,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'phlebotomist', 'lab'],
    required: true
  },
  address: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  bloodGroup: {
    type: String
  },
  specialization: { // For phlebotomists
    type: String
  },
  licenseNumber: { // For phlebotomists and labs
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

module.exports = mongoose.model('User', userSchema);