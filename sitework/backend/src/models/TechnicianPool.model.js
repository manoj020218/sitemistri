const mongoose = require('mongoose');
const { Schema } = mongoose;

const poolSchema = new Schema({
  siUserId:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  technicianUserId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  source:   { type: String, enum: ['SI_LINK','CALLED','ASSIGNED','COMPLETED_WORK'] },
  status:   { type: String, enum: ['NEW_CONNECTION','CALL_VERIFIED','FIRST_WORK_DONE','TRUSTED_BY_SI'], default: 'NEW_CONNECTION' },
}, { timestamps: true });

poolSchema.index({ siUserId: 1, technicianUserId: 1 }, { unique: true });

module.exports = mongoose.model('TechnicianPool', poolSchema);
