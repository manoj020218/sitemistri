const SiteWork          = require('../models/SiteWork.model');
const TechnicianProfile = require('../models/TechnicianProfile.model');
const TechnicianPool    = require('../models/TechnicianPool.model');
const { sendToUser }    = require('../services/fcm.service');
const { deleteProofPhoto } = require('../services/proofCleanup.service');
const { ok, err }       = require('../utils/response');
const crypto            = require('crypto');
const fs                = require('fs');

// ── Helpers ──
const stamp    = (field) => ({ [`timestamps.${field}`]: new Date() });
const setStatus = (status, extraStamp) => ({ status, ...stamp(extraStamp) });

const updateTrustOnClose = async (techUserId, rating) => {
  const stats = { $inc: { 'trustStats.completedSiteWork': 1 } };
  if (rating?.stars) {
    const profile = await TechnicianProfile.findOne({ userId: techUserId });
    if (profile) {
      const total = (profile.trustStats.totalRatings || 0) + 1;
      const avg   = ((profile.trustStats.averageRating || 0) * (total - 1) + rating.stars) / total;
      stats.$set = { 'trustStats.averageRating': avg, 'trustStats.totalRatings': total };
    }
  }
  // Unique SIs: distinct siUserIds with CLOSED status
  const uniqueSIs = await SiteWork.distinct('siUserId', { technicianUserId: techUserId, status: 'CLOSED' });
  if (!stats.$set) stats.$set = {};
  stats.$set['trustStats.uniqueSIs'] = uniqueSIs.length;

  await TechnicianProfile.findOneAndUpdate({ userId: techUserId }, stats);
};

// ── Controllers ──

exports.update = async (req, res) => {
  try {
    const work = await SiteWork.findById(req.params.id);
    if (!work) return err(res, 'Not found', 404);
    if (work.siUserId.toString() !== req.user._id.toString())
      return err(res, 'Forbidden', 403);

    const TERMINAL = ['CLOSED','CANCELLED_BY_SI','CANCELLED_BY_TECH','REJECTED','DISPUTED','OVERDUE'];
    if (TERMINAL.includes(work.status))
      return err(res, 'Cannot edit a closed or cancelled site work', 400);

    const ALLOWED = [
      'clientName','clientMobile','clientHouseNo','siteAddress',
      'workType','description','preferredVisitTime','agreedVisitCharge',
      'materialIncluded','paymentBy','paymentMode',
    ];
    const patch = {};
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    if (!Object.keys(patch).length) return err(res, 'No valid fields provided', 400);

    const updated = await SiteWork.findByIdAndUpdate(
      req.params.id, { $set: patch }, { new: true, runValidators: true }
    ).populate('siUserId', 'name mobile').populate('technicianUserId', 'name mobile');

    // Best-effort: notify tech that job details changed
    sendToUser(work.technicianUserId, 'SITE_WORK_UPDATED', { siteWorkId: work._id.toString() }).catch(() => {});

    return ok(res, updated, 'Site work updated');
  } catch (e) { return err(res, e.message, 500); }
};

exports.create = async (req, res) => {
  try {
    const si = req.user;
    const { technicianUserId } = req.body;
    if (!technicianUserId) return err(res, 'technicianUserId required');
    if (technicianUserId === si._id.toString()) return err(res, 'Cannot assign work to yourself');

    const work = await SiteWork.create({
      ...req.body,
      siUserId:  si._id,
      status:    'PENDING_ACCEPTANCE',
      'timestamps.assignedAt': new Date(),
    });

    // Add to pool
    await TechnicianPool.findOneAndUpdate(
      { siUserId: si._id, technicianUserId },
      { siUserId: si._id, technicianUserId, source: 'ASSIGNED' },
      { upsert: true }
    );

    await sendToUser(technicianUserId, 'SITE_WORK_ASSIGNED', { siteWorkId: work._id.toString() });
    return ok(res, work, 'Site Work created', 201);
  } catch (e) { return err(res, e.message, 500); }
};

exports.getOne = async (req, res) => {
  try {
    const work = await SiteWork.findById(req.params.id)
      .populate('siUserId', 'name mobile')
      .populate('technicianUserId', 'name mobile');
    if (!work) return err(res, 'Not found', 404);
    const uid = req.user._id.toString();
    if (work.siUserId._id.toString() !== uid && work.technicianUserId._id.toString() !== uid)
      return err(res, 'Forbidden', 403);
    return ok(res, work);
  } catch (e) { return err(res, e.message, 500); }
};

exports.list = async (req, res) => {
  try {
    const uid = req.user._id;
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const query = { $or: [{ siUserId: uid }, { technicianUserId: uid }] };
    const works = await SiteWork.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return ok(res, works);
  } catch (e) { return err(res, e.message, 500); }
};

const techAction = (statusTo, stampKey, notifyEvent, notifyTarget = 'si') => async (req, res) => {
  try {
    const work = await SiteWork.findById(req.params.id);
    if (!work) return err(res, 'Not found', 404);
    if (work.technicianUserId.toString() !== req.user._id.toString()) return err(res, 'Forbidden', 403);

    await SiteWork.findByIdAndUpdate(work._id, setStatus(statusTo, stampKey));

    const target = notifyTarget === 'si' ? work.siUserId : work.technicianUserId;
    await sendToUser(target, notifyEvent, { siteWorkId: work._id.toString() });
    return ok(res, null, `Status: ${statusTo}`);
  } catch (e) { return err(res, e.message, 500); }
};

exports.accept      = techAction('ACCEPTED',     'acceptedAt',            'TECH_ACCEPTED');

exports.reject = async (req, res) => {
  try {
    const work = await SiteWork.findById(req.params.id);
    if (!work) return err(res, 'Not found', 404);
    if (work.technicianUserId.toString() !== req.user._id.toString()) return err(res, 'Forbidden', 403);
    const update = { ...setStatus('REJECTED', 'rejectedAt') };
    if (req.body.reason) update.rejectionReason = req.body.reason;
    await SiteWork.findByIdAndUpdate(work._id, update);
    await sendToUser(work.siUserId, 'TECH_REJECTED', { siteWorkId: work._id.toString() });
    return ok(res, null, 'Status: REJECTED');
  } catch (e) { return err(res, e.message, 500); }
};
exports.startTravel = techAction('ON_THE_WAY',   'travelStartedAt', 'TECH_ON_THE_WAY');
exports.reached     = techAction('REACHED',      'reachedAt',       'TECH_REACHED');
exports.startWork   = techAction('WORK_STARTED', 'workStartedAt',   null);

exports.complete = async (req, res) => {
  try {
    const work = await SiteWork.findById(req.params.id);
    if (!work) return err(res, 'Not found', 404);
    if (work.technicianUserId.toString() !== req.user._id.toString()) return err(res, 'Forbidden', 403);
    const update = setStatus('COMPLETED', 'technicianCompletedAt');
    if (req.body?.technicianRemark?.trim()) update.technicianRemark = req.body.technicianRemark.trim();
    await SiteWork.findByIdAndUpdate(work._id, update);
    await sendToUser(work.siUserId, 'TECH_COMPLETED', { siteWorkId: work._id.toString() });
    return ok(res, null, 'Status: COMPLETED');
  } catch (e) { return err(res, e.message, 500); }
};

exports.uploadProof = async (req, res) => {
  try {
    if (!req.file) return err(res, 'No file uploaded');
    const work = await SiteWork.findById(req.params.id);
    if (!work) return err(res, 'Not found', 404);
    if (work.technicianUserId.toString() !== req.user._id.toString()) return err(res, 'Forbidden', 403);
    if (work.status !== 'COMPLETED') return err(res, 'Work must be COMPLETED first');

    // Frontend already compresses to WebP ≤ ~300 KB — no server-side sharp needed
    const hash = crypto.createHash('sha256').update(fs.readFileSync(req.file.path)).digest('hex');

    await SiteWork.findByIdAndUpdate(work._id, {
      'proof.photoUploaded':  true,
      'proof.photoPath':      req.file.path,
      'proof.uploadedAt':     new Date(),
      'proof.storageStatus':  'TEMP_STORED',
      'proof.sha256Hash':     hash,
    });

    return ok(res, { path: req.file.path });
  } catch (e) { return err(res, e.message, 500); }
};

exports.closeBySI = async (req, res) => {
  try {
    const work = await SiteWork.findById(req.params.id);
    if (!work) return err(res, 'Not found', 404);
    if (work.siUserId.toString() !== req.user._id.toString()) return err(res, 'Forbidden', 403);
    if (work.status !== 'COMPLETED') return err(res, 'Work must be in COMPLETED status');

    const { stars, reachedOnTime, skillMatch, workCompleted, behaviourGood, comment } = req.body;

    await SiteWork.findByIdAndUpdate(work._id, {
      status: 'CLOSED',
      'timestamps.siClosedAt': new Date(),
      'ratingBySI': { stars, reachedOnTime, skillMatch, workCompleted, behaviourGood, comment, ratedAt: new Date() },
      'proof.acceptedAt': new Date(),
    });

    // Delete proof photo immediately
    await deleteProofPhoto(await SiteWork.findById(work._id));

    // Update trust stats
    await updateTrustOnClose(work.technicianUserId, { stars });

    await sendToUser(work.technicianUserId, 'SI_CLOSED', { siteWorkId: work._id.toString() });
    return ok(res, null, 'Site Work closed');
  } catch (e) { return err(res, e.message, 500); }
};

exports.cancel = async (req, res) => {
  try {
    const work = await SiteWork.findById(req.params.id);
    if (!work) return err(res, 'Not found', 404);
    const uid = req.user._id.toString();
    const isSI   = work.siUserId.toString()         === uid;
    const isTech = work.technicianUserId.toString()  === uid;
    if (!isSI && !isTech) return err(res, 'Forbidden', 403);

    const newStatus = isSI ? 'CANCELLED_BY_SI' : 'CANCELLED_BY_TECH';
    if (isTech && newStatus === 'CANCELLED_BY_TECH') {
      await TechnicianProfile.findOneAndUpdate(
        { userId: work.technicianUserId },
        { $inc: { 'trustStats.cancelledAfterAccept': 1 } }
      );
    }

    await SiteWork.findByIdAndUpdate(work._id, {
      status: newStatus,
      'timestamps.cancelledAt': new Date(),
    });
    return ok(res, null, 'Cancelled');
  } catch (e) { return err(res, e.message, 500); }
};

exports.reportIssue = async (req, res) => {
  try {
    const work = await SiteWork.findById(req.params.id);
    if (!work) return err(res, 'Not found', 404);
    if (work.technicianUserId.toString() !== req.user._id.toString()) return err(res, 'Forbidden', 403);

    await SiteWork.findByIdAndUpdate(work._id, {
      privateIssueByTechnician: {
        hasIssue: true,
        reason:   req.body.reason,
        comment:  req.body.comment,
        reportedAt: new Date(),
      },
    });
    return ok(res, null, 'Issue reported');
  } catch (e) { return err(res, e.message, 500); }
};
