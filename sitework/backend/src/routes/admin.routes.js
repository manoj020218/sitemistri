const router = require('express').Router();
const ctrl   = require('../controllers/admin.controller');
const { protect, requireAdmin } = require('../middleware/auth.middleware');

router.use(protect, requireAdmin);

router.get  ('/users',                    ctrl.listUsers);
router.get  ('/users/:id',                ctrl.getUser);
router.post ('/users/:id/block',          ctrl.blockUser);
router.get  ('/site-works',               ctrl.listSiteWorks);
router.get  ('/stats',                    ctrl.getStats);
router.get  ('/city-stats',               ctrl.getCityStats);
router.get  ('/proof-photos',             ctrl.listProofPhotos);
router.post ('/proof-photos/:id/force-delete', ctrl.forceDeleteProof);
router.get  ('/terms-config',             ctrl.getTermsConfig);

module.exports = router;
