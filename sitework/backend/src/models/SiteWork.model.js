const mongoose = require('mongoose');
const { Schema } = mongoose;

const siteWorkSchema = new Schema({
  siUserId:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  technicianUserId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientName:        String,
  clientMobile:      String,
  siteAddress:       String,
  siteLocation: {
    type:        { type: String, enum: ['Point'] },
    coordinates: [Number],
  },
  workType:         String,
  requiredSkills:   [String],
  description:      String,
  preferredVisitTime: Date,
  agreedVisitCharge:  Number,
  materialIncluded:  { type: String, enum: ['YES','NO','NOT_SURE'] },
  paymentBy:         { type: String, enum: ['SI','CLIENT','OTHER'] },
  paymentMode:       { type: String, enum: ['CASH','UPI','LATER','DIRECT'] },
  status: {
    type: String,
    enum: ['DRAFT','PENDING_ACCEPTANCE','ACCEPTED','REJECTED','ON_THE_WAY',
           'REACHED','WORK_STARTED','COMPLETED','CLOSED',
           'CANCELLED_BY_SI','CANCELLED_BY_TECH','DISPUTED','OVERDUE'],
    default: 'PENDING_ACCEPTANCE',
  },
  timestamps: {
    assignedAt:            Date,
    acceptedAt:            Date,
    rejectedAt:            Date,
    travelStartedAt:       Date,
    reachedAt:             Date,
    workStartedAt:         Date,
    technicianCompletedAt: Date,
    siClosedAt:            Date,
    cancelledAt:           Date,
  },
  proof: {
    photoUploaded:  { type: Boolean, default: false },
    photoPath:      String,
    uploadedAt:     Date,
    acceptedAt:     Date,
    deletedAt:      Date,
    storageStatus:  { type: String, enum: ['NONE','TEMP_STORED','DELETED','EXPIRED'], default: 'NONE' },
    sha256Hash:     String,
  },
  ratingBySI: {
    stars:         Number,
    reachedOnTime: Boolean,
    skillMatch:    Boolean,
    workCompleted: Boolean,
    behaviourGood: Boolean,
    comment:       String,
    ratedAt:       Date,
  },
  privateIssueByTechnician: {
    hasIssue:    { type: Boolean, default: false },
    reason:      String,
    comment:     String,
    reportedAt:  Date,
  },
}, { timestamps: true });

siteWorkSchema.index({ siUserId: 1, status: 1 });
siteWorkSchema.index({ technicianUserId: 1, status: 1 });
siteWorkSchema.index({ 'proof.storageStatus': 1, 'proof.uploadedAt': 1 });

module.exports = mongoose.model('SiteWork', siteWorkSchema);
