const User              = require('../models/User.model');
const SiteWork          = require('../models/SiteWork.model');
const TechnicianProfile = require('../models/TechnicianProfile.model');
const { deleteProofPhoto } = require('../services/proofCleanup.service');
const { ok, err }       = require('../utils/response');

exports.listUsers = async (req, res) => {
  try {
    const { q, role, blocked, page = 1, limit = 20 } = req.query;
    const query = {};
    if (q) query.$or = [
      { name:   { $regex: q, $options: 'i' } },
      { mobile: { $regex: q, $options: 'i' } },
      { email:  { $regex: q, $options: 'i' } },
    ];
    if (role)    query.roles    = role;
    if (blocked) query.isBlocked = blocked === 'true';

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit))
      .lean();
    const total = await User.countDocuments(query);
    return ok(res, { users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) { return err(res, e.message, 500); }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return err(res, 'Not found', 404);
    const works = await SiteWork.countDocuments({ $or: [{ siUserId: user._id }, { technicianUserId: user._id }] });
    return ok(res, { user, totalWorks: works });
  } catch (e) { return err(res, e.message, 500); }
};

exports.blockUser = async (req, res) => {
  try {
    const { block, reason } = req.body;
    await User.findByIdAndUpdate(req.params.id, { isBlocked: !!block, blockedReason: reason || '' });
    return ok(res, null, block ? 'User blocked' : 'User unblocked');
  } catch (e) { return err(res, e.message, 500); }
};

exports.listSiteWorks = async (req, res) => {
  try {
    const { status, city, q, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const works = await SiteWork.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit))
      .populate('siUserId', 'name')
      .populate('technicianUserId', 'name')
      .lean();
    const total = await SiteWork.countDocuments(query);
    return ok(res, { works, total });
  } catch (e) { return err(res, e.message, 500); }
};

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalTechs, totalSIs, blocked, totalWork, closedWork, overdueWork, tempPhotos] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ roles: 'TECHNICIAN' }),
        User.countDocuments({ roles: 'SI' }),
        User.countDocuments({ isBlocked: true }),
        SiteWork.countDocuments(),
        SiteWork.countDocuments({ status: 'CLOSED' }),
        SiteWork.countDocuments({ status: 'OVERDUE' }),
        SiteWork.countDocuments({ 'proof.storageStatus': 'TEMP_STORED' }),
      ]);
    return ok(res, { totalUsers, totalTechs, totalSIs, blocked, totalWork, closedWork, overdueWork, tempPhotos });
  } catch (e) { return err(res, e.message, 500); }
};

exports.getCityStats = async (req, res) => {
  try {
    const cityStats = await TechnicianProfile.aggregate([
      { $group: { _id: '$city', techs: { $sum: 1 } } },
    ]);
    return ok(res, cityStats);
  } catch (e) { return err(res, e.message, 500); }
};

exports.listProofPhotos = async (req, res) => {
  try {
    const photos = await SiteWork.find({ 'proof.storageStatus': { $in: ['TEMP_STORED','DELETED'] } })
      .select('proof timestamps.technicianCompletedAt technicianUserId')
      .populate('technicianUserId', 'name')
      .sort({ 'proof.uploadedAt': -1 })
      .lean();
    return ok(res, photos);
  } catch (e) { return err(res, e.message, 500); }
};

exports.forceDeleteProof = async (req, res) => {
  try {
    const work = await SiteWork.findById(req.params.id);
    if (!work) return err(res, 'Not found', 404);
    await deleteProofPhoto(work);
    return ok(res, null, 'Proof photo deleted');
  } catch (e) { return err(res, e.message, 500); }
};

exports.getTermsConfig = async (req, res) => {
  ok(res, { termsVersion: process.env.TERMS_VERSION, privacyVersion: process.env.PRIVACY_VERSION });
};
