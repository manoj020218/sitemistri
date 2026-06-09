const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  googleId:       { type: String, unique: true, required: true },
  email:          { type: String, unique: true, required: true },
  emailVerified:  { type: Boolean, default: false },
  name:           { type: String, required: true },
  photoUrl:       String,
  mobile:         String,
  mobileStatus:   { type: String, enum: ['SELF_ADDED','SI_CALL_VERIFIED','WORK_VERIFIED','MULTI_SI_VERIFIED'], default: 'SELF_ADDED' },
  roles:          [{ type: String, enum: ['TECHNICIAN','SI'] }],
  language:       { type: String, enum: ['hi','en'], default: 'hi' },
  termsAccepted:  { type: Boolean, default: false },
  termsVersion:   String,
  privacyVersion: String,
  acceptedAt:     Date,
  acceptedIp:     String,
  acceptedUserAgent: String,
  isBlocked:      { type: Boolean, default: false },
  blockedReason:  String,
  lastActiveAt:   Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
