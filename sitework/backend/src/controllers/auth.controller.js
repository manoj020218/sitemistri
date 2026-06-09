const User                  = require('../models/User.model');
const { verifyGoogleToken } = require('../services/google.auth.service');
const { sign }              = require('../services/jwt.service');
const NotificationToken     = require('../models/NotificationToken.model');
const { ok, err }           = require('../utils/response');

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return err(res, 'credential required');

    const payload = await verifyGoogleToken(credential);
    const { sub: googleId, email, name, picture, email_verified } = payload;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.create({ googleId, email, name, photoUrl: picture, emailVerified: !!email_verified });
    }
    if (user.isBlocked) return err(res, 'Account blocked', 403);

    const token = sign(user._id);
    const isNew = !user.termsAccepted || !user.roles.length;
    return ok(res, { token, user, isNew });
  } catch (e) {
    return err(res, e.message, 500);
  }
};

exports.getMe = async (req, res) => ok(res, req.user);

exports.acceptTerms = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      termsAccepted:     true,
      termsVersion:      process.env.TERMS_VERSION   || 'v1.0',
      privacyVersion:    process.env.PRIVACY_VERSION || 'v1.0',
      acceptedAt:        new Date(),
      acceptedIp:        req.ip,
      acceptedUserAgent: req.headers['user-agent'],
    });
    return ok(res, null, 'Terms accepted');
  } catch (e) { return err(res, e.message, 500); }
};

exports.setMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!/^[6-9]\d{9}$/.test(mobile)) return err(res, 'Invalid mobile number');
    await User.findByIdAndUpdate(req.user._id, { mobile, mobileStatus: 'SELF_ADDED' });
    return ok(res, null, 'Mobile saved');
  } catch (e) { return err(res, e.message, 500); }
};

exports.setRoles = async (req, res) => {
  try {
    const { roles } = req.body;
    const valid = ['TECHNICIAN','SI'];
    if (!roles?.length || !roles.every(r => valid.includes(r)))
      return err(res, 'Invalid roles');
    await User.findByIdAndUpdate(req.user._id, { roles });
    return ok(res, null, 'Roles saved');
  } catch (e) { return err(res, e.message, 500); }
};

exports.registerFcmToken = async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    if (!token) return err(res, 'token required');
    await NotificationToken.findOneAndUpdate(
      { fcmToken: token },
      { userId: req.user._id, fcmToken: token, platform, lastUsedAt: new Date() },
      { upsert: true }
    );
    return ok(res, null, 'Token registered');
  } catch (e) { return err(res, e.message, 500); }
};

exports.removeFcmToken = async (req, res) => {
  try {
    await NotificationToken.deleteOne({ userId: req.user._id, fcmToken: req.body.token });
    return ok(res, null, 'Token removed');
  } catch (e) { return err(res, e.message, 500); }
};
