const router  = require('express').Router();
const ctrl    = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const limiter = require('express-rate-limit')({ windowMs: 60000, max: 10 });

router.post('/google',       limiter, ctrl.googleLogin);
router.get ('/me',           protect, ctrl.getMe);
router.post('/accept-terms', protect, ctrl.acceptTerms);
router.post('/mobile',       protect, ctrl.setMobile);
router.post('/roles',        protect, ctrl.setRoles);
router.post('/fcm-token',    protect, ctrl.registerFcmToken);
router.delete('/fcm-token',  protect, ctrl.removeFcmToken);

module.exports = router;
