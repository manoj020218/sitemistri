const router = require('express').Router();
const ctrl   = require('../controllers/technician.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

// Profile CRUD — /profile aliases for frontend consistency
router.get   ('/profile',     protect, ctrl.getMyProfile);
router.put   ('/profile',     protect, ctrl.createOrUpdateProfile);
router.post  ('/photo',       protect, upload.single('photo'), ctrl.uploadProfilePhoto);

// Legacy root paths (keep for backward compat)
router.post  ('/',            protect, ctrl.createOrUpdateProfile);
router.get   ('/',            protect, ctrl.getMyProfile);
router.patch ('/',            protect, ctrl.createOrUpdateProfile);

router.post  ('/availability', protect, ctrl.updateAvailability);
router.post  ('/location',     protect, ctrl.updateLocation);
router.get   ('/site-works',   protect, ctrl.getMySiteWorks);

module.exports = router;
