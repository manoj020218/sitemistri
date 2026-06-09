const mongoose = require('mongoose');
const { Schema } = mongoose;

const techSchema = new Schema({
  userId:          { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  city:            String,
  workingAreas:    [String],
  skills:          [String],
  workTypes:       [String],
  experienceLevel: { type: String, enum: ['NEW','1_PLUS','3_PLUS','5_PLUS','10_PLUS'] },
  tools:           [String],
  vehicle:         { type: String, enum: ['BIKE','SCOOTER','CAR','NONE'] },
  availability:    { type: String, enum: ['AVAILABLE_NOW','AVAILABLE_TODAY','AVAILABLE_TOMORROW','BUSY','OFFLINE'], default: 'OFFLINE' },
  currentLocation: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },  // [lng, lat]
    accuracy:    Number,
    updatedAt:   Date,
  },
  permanentAddress: String,
  approxAge:        Number,
  customPhotoUrl:  String,
  generatedBioHi:  String,
  generatedBioEn:  String,
  profileSlug:     { type: String, unique: true, sparse: true },
  profileStrength: { type: Number, default: 0 },
  trustStats: {
    completedSiteWork:  { type: Number, default: 0 },
    uniqueSIs:          { type: Number, default: 0 },
    repeatSIWork:       { type: Number, default: 0 },
    noShow:             { type: Number, default: 0 },
    cancelledAfterAccept: { type: Number, default: 0 },
    overdueOpenWork:    { type: Number, default: 0 },
    averageRating:      { type: Number, default: 0 },
    totalRatings:       { type: Number, default: 0 },
  },
}, { timestamps: true });

techSchema.index({ currentLocation: '2dsphere' });
techSchema.index({ availability: 1, skills: 1 });

module.exports = mongoose.model('TechnicianProfile', techSchema);
