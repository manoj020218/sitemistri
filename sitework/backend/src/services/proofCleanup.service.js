const fs       = require('fs').promises;
const path     = require('path');
const SiteWork = require('../models/SiteWork.model');

const deleteProofPhoto = async (siteWork) => {
  if (siteWork.proof?.photoPath) {
    try { await fs.unlink(siteWork.proof.photoPath); } catch (_) {}
  }
  await SiteWork.updateOne(
    { _id: siteWork._id },
    {
      'proof.photoPath':     null,
      'proof.storageStatus': 'DELETED',
      'proof.deletedAt':     new Date(),
    }
  );
};

const runCleanup = async () => {
  const days   = parseInt(process.env.PROOF_PHOTO_AUTO_DELETE_DAYS || 7);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const stale = await SiteWork.find({
    'proof.storageStatus': 'TEMP_STORED',
    'proof.uploadedAt':    { $lt: cutoff },
  }).select('_id proof.photoPath').lean();

  console.log(`[Cleanup] Found ${stale.length} stale proof photos`);
  for (const sw of stale) await deleteProofPhoto(sw);
};

module.exports = { deleteProofPhoto, runCleanup };
