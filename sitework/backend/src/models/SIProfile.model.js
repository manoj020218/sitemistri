const mongoose = require('mongoose');
const { Schema } = mongoose;

const siSchema = new Schema({
  userId:          { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  businessName:    String,
  city:            String,
  workingAreas:    [String],
  businessType:    { type: String, enum: ['SI','CONTRACTOR','DEALER','SERVICE_PROVIDER'] },
  workCategories:  [String],
  businessAddress: String,
  customPhotoUrl:  String,
  siSlug:          { type: String, unique: true, sparse: true },
}, { timestamps: true });

module.exports = mongoose.model('SIProfile', siSchema);
