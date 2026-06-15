const TechnicianProfile     = require('../models/TechnicianProfile.model');
const { generateBio, calcStrength } = require('../services/profileText.service');
const { ok, err }           = require('../utils/response');
const slugify               = (name, city) =>
  `${name}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g,'');

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const { city, skills=[], experienceLevel, tools=[], vehicle, availability, workTypes=[], workingAreas=[], permanentAddress, approxAge, pincode } = req.body;
    const user = req.user;

    const bio = generateBio(user.name, { city, skills, experienceLevel, tools });

    const slug = slugify(user.name, city || 'india');
    const strength = calcStrength({ city, skills, experienceLevel, tools, vehicle, availability });

    const profile = await TechnicianProfile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id, city, skills, experienceLevel, tools, vehicle,
        availability: availability || 'OFFLINE',
        workTypes, workingAreas, permanentAddress, approxAge,
        ...(pincode ? { pincode: String(pincode).trim() } : {}),
        generatedBioHi: bio.hi, generatedBioEn: bio.en,
        profileSlug: slug, profileStrength: strength,
      },
      { upsert: true, new: true }
    );
    return ok(res, profile, 'Profile saved');
  } catch (e) { return err(res, e.message, 500); }
};

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await TechnicianProfile.findOne({ userId: req.user._id });
    if (!profile) return err(res, 'Profile not found', 404);
    return ok(res, profile);
  } catch (e) { return err(res, e.message, 500); }
};

exports.updateAvailability = async (req, res) => {
  try {
    const valid = ['AVAILABLE_NOW','AVAILABLE_TODAY','AVAILABLE_TOMORROW','BUSY','OFFLINE'];
    const { availability } = req.body;
    if (!valid.includes(availability)) return err(res, 'Invalid availability');
    await TechnicianProfile.findOneAndUpdate({ userId: req.user._id }, { availability });
    return ok(res, null, 'Availability updated');
  } catch (e) { return err(res, e.message, 500); }
};

exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng, accuracy } = req.body;
    if (lat == null || lng == null) return err(res, 'lat and lng required');
    await TechnicianProfile.findOneAndUpdate(
      { userId: req.user._id },
      { currentLocation: { type: 'Point', coordinates: [lng, lat], accuracy, updatedAt: new Date() } }
    );
    return ok(res, null, 'Location updated');
  } catch (e) { return err(res, e.message, 500); }
};

exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return err(res, 'No file uploaded');
    const photoUrl = `/uploads/${req.file.filename}`;
    await TechnicianProfile.findOneAndUpdate({ userId: req.user._id }, { customPhotoUrl: photoUrl }, { upsert: true });
    return ok(res, { photoUrl }, 'Photo updated');
  } catch (e) { return err(res, e.message, 500); }
};

exports.getMySiteWorks = async (req, res) => {
  try {
    const SiteWork = require('../models/SiteWork.model');
    const works = await SiteWork.find({ technicianUserId: req.user._id })
      .sort({ createdAt: -1 }).limit(50)
      .populate('siUserId','name mobile')
      .lean();
    return ok(res, works);
  } catch (e) { return err(res, e.message, 500); }
};
