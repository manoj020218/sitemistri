const router = require('express').Router();
const SIProfile      = require('../models/SIProfile.model');
const TechnicianPool = require('../models/TechnicianPool.model');
const { protect }    = require('../middleware/auth.middleware');
const { upload }     = require('../middleware/upload.middleware');
const { ok, err }    = require('../utils/response');
const path           = require('path');

const slugify = (name, city) =>
  `${name}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Create/update SI profile
router.post('/', protect, async (req, res) => {
  try {
    const user = req.user;
    const { businessName, city, workingAreas, businessType, workCategories, businessAddress } = req.body;
    const siSlug = slugify(businessName || user.name, city || 'india');
    const profile = await SIProfile.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id, businessName, city, workingAreas, businessType, workCategories, businessAddress, siSlug },
      { upsert: true, new: true }
    );
    return ok(res, profile);
  } catch (e) { return err(res, e.message, 500); }
});

router.put('/', protect, async (req, res) => {
  try {
    const user = req.user;
    const { businessName, city, workingAreas, businessType, workCategories, businessAddress } = req.body;
    const siSlug = slugify(businessName || user.name, city || 'india');
    const profile = await SIProfile.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id, businessName, city, workingAreas, businessType, workCategories, businessAddress, siSlug },
      { upsert: true, new: true }
    );
    return ok(res, profile);
  } catch (e) { return err(res, e.message, 500); }
});

router.get('/', protect, async (req, res) => {
  try {
    const p = await SIProfile.findOne({ userId: req.user._id }).lean();
    return p ? ok(res, p) : ok(res, null);
  } catch (e) { return err(res, e.message, 500); }
});

router.post('/photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return err(res, 'No file uploaded');
    const photoUrl = `/api/uploads/${path.basename(req.file.path)}`;
    await SIProfile.findOneAndUpdate(
      { userId: req.user._id },
      { customPhotoUrl: photoUrl },
      { upsert: true }
    );
    return ok(res, { photoUrl }, 'Photo updated');
  } catch (e) { return err(res, e.message, 500); }
});

router.get('/technician-pool', protect, async (req, res) => {
  try {
    const pool = await TechnicianPool.find({ siUserId: req.user._id })
      .populate('technicianUserId', 'name mobile')
      .sort({ updatedAt: -1 })
      .lean();
    return ok(res, pool);
  } catch (e) { return err(res, e.message, 500); }
});

router.get('/site-works', protect, async (req, res) => {
  try {
    const SiteWork = require('../models/SiteWork.model');
    const works = await SiteWork.find({ siUserId: req.user._id })
      .sort({ createdAt: -1 }).limit(100)
      .populate('technicianUserId', 'name mobile')
      .lean();
    return ok(res, works);
  } catch (e) { return err(res, e.message, 500); }
});

module.exports = router;
