require('dotenv').config();
const app         = require('./app');
const connectDB   = require('./config/db');
const { initFirebase } = require('./config/firebase');
require('./jobs/proofPhotoCleanup.job');

const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();
  initFirebase();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
})();
