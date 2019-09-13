const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trackItemSchema = require('./TrackItem');

// Create Schema
const UserSchema = new Schema({
  userType: {
    type: String,
    required: true
  },
  googleEmail: {
    type: String,
    required: false
  },
  facebookEmail: {
    type: String,
    required: false
  },
  twitterEmail: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: false,
    default: 'User'
  },
  password: {
    type: String,
    required: false
  },
  favouritesList: [trackItemSchema],
  favouritesSaveTimestamp: String
});

mongoose.model('users', UserSchema);
