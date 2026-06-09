const TechnicianProfile = require('../models/TechnicianProfile.model');
const SIProfile         = require('../models/SIProfile.model');
const User              = require('../models/User.model');
const { ok, err }       = require('../utils/response');

exports.getTechProfile = async (req, res) => {
  try {
    const profile = await TechnicianProfile.findOne({ profileSlug: req.params.slug })
      .populate('userId', 'name photoUrl')
      .lean();
    if (!profile) return err(res, 'Profile not found', 404);
    // Return approximate info only — no exact location
    const { currentLocation, ...safe } = profile;
    return ok(res, safe);
  } catch (e) { return err(res, e.message, 500); }
};

exports.getSIHiringPage = async (req, res) => {
  try {
    const siProfile = await SIProfile.findOne({ siSlug: req.params.slug })
      .populate('userId', 'name')
      .lean();
    if (!siProfile) return err(res, 'SI not found', 404);
    return ok(res, siProfile);
  } catch (e) { return err(res, e.message, 500); }
};
