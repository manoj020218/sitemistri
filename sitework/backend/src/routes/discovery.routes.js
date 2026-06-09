const router  = require('express').Router();
const ctrl    = require('../controllers/discovery.controller');
const { protect } = require('../middleware/auth.middleware');
const limiter = require('express-rate-limit')({ windowMs: 60000, max: 30 });

router.post('/nearby', protect, limiter, ctrl.nearby);

module.exports = router;
