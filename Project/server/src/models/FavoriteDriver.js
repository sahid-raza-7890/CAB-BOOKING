const mongoose = require('mongoose');

const favoriteDriverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 200
  }
}, {
  timestamps: true
});

// A user can only favorite a specific driver once
favoriteDriverSchema.index({ user: 1, driver: 1 }, { unique: true });

module.exports = mongoose.model('FavoriteDriver', favoriteDriverSchema);
