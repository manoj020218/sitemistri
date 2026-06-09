const router = require('express').Router();
const ctrl   = require('../controllers/sitework.controller');
const { protect }  = require('../middleware/auth.middleware');
const { upload }   = require('../middleware/upload.middleware');

router.post  ('/',                       protect, ctrl.create);
router.get   ('/',                       protect, ctrl.list);
router.get   ('/:id',                    protect, ctrl.getOne);
router.post  ('/:id/accept',             protect, ctrl.accept);
router.post  ('/:id/reject',             protect, ctrl.reject);
router.post  ('/:id/start-travel',       protect, ctrl.startTravel);
router.post  ('/:id/reached',            protect, ctrl.reached);
router.post  ('/:id/start-work',         protect, ctrl.startWork);
router.post  ('/:id/complete',           protect, ctrl.complete);
router.post  ('/:id/proof-photo',        protect, upload.single('photo'), ctrl.uploadProof);
router.post  ('/:id/close',              protect, ctrl.closeBySI);
router.post  ('/:id/cancel',             protect, ctrl.cancel);
router.post  ('/:id/report-issue',       protect, ctrl.reportIssue);

module.exports = router;
