const jwt  = require('jsonwebtoken');
const User = require('../models/User.model');
const { err } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return err(res, 'No token', 401);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-__v').lean();
    if (!user)          return err(res, 'User not found', 401);
    if (user.isBlocked) return err(res, 'Account blocked', 403);
    req.user = user;
    await User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() });
    next();
  } catch (e) {
    return err(res, 'Invalid token', 401);
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user.roles.includes(role))
    return err(res, `${role} role required`, 403);
  next();
};

const requireAdmin = (req, res, next) => {
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  if (!admins.includes(req.user.email))
    return err(res, 'Admin access required', 403);
  next();
};

module.exports = { protect, requireRole, requireAdmin };
