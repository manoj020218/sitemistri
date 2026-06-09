const cron              = require('node-cron');
const { runCleanup }    = require('../services/proofCleanup.service');

// Run daily at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('[Cron] Running proof photo cleanup...');
  try { await runCleanup(); }
  catch (e) { console.error('[Cron] Cleanup failed:', e.message); }
});

console.log('✅ Proof photo cleanup cron scheduled');
