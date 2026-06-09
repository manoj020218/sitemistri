const router  = require('express').Router();
const ctrl    = require('../controllers/public.controller');
const limiter = require('express-rate-limit')({ windowMs: 60000, max: 60 });

router.get('/technician/:slug', limiter, ctrl.getTechProfile);
router.get('/si/:slug',         limiter, ctrl.getSIHiringPage);

module.exports = router;
