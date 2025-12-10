// // // Appointment.js
// // const mongoose = require('mongoose');

// // const appointmentSchema = new mongoose.Schema({
// //   user: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'User',
// //     required: true
// //   },
// //   phlebotomist: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'User'
// //   },
// //   tests: [{
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'Test',
// //   }],
// //   appointmentDate: {
// //     type: Date,
// //     required: true
// //   },
// //   status: {
// //     type: String,
// //     enum: ['pending', 'scheduled', 'completed', 'cancelled'],
// //     default: 'pending'
// //   },
// //   sampleCollected: {
// //     type: Boolean,
// //     default: false
// //   },
// //   sampleCollectedAt: {
// //     type: Date
// //   },
// //   lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab' },
// //   result: {
// //     type: String
// //   },
// //   reportFile: {
// //     type: String
// //   },
// //   resultDate: {
// //     type: Date
// //   },
// //   notes: {
// //     type: String
// //   },
// //   createdAt: {
// //     type: Date,
// //     default: Date.now
// //   }
// // });

// // module.exports = mongoose.model('Appointment', appointmentSchema);
// // models/Appointment.js
// const mongoose = require('mongoose');

// const appointmentSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   phlebotomist: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   tests: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Test',
//   }],
//   appointmentDate: {
//     type: Date,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'scheduled', 'completed', 'cancelled'],
//     default: 'pending'
//   },
//   sampleCollected: {
//     type: Boolean,
//     default: false
//   },
//   sampleCollectedAt: Date,
//   lab: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Lab'
//   },
//   result: String,
//   reportFile: String,
//   resultDate: Date,
//   notes: String,
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('Appointment', appointmentSchema);
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phlebotomist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
  }],
  appointmentDate: {
    type: Date,
    required: true
  },
  lab: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab'
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled','in_lab'],
    default: 'pending'
  },
  sampleCollected: {
    type: Boolean,
    default: false
  },
  result: String,
  reportFile: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('Appointment', appointmentSchema);