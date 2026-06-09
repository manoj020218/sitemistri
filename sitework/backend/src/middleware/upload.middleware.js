const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const uploadDir = process.env.TEMP_UPLOAD_DIR || './uploads/temp';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename:    (_, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `proof-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_, file, cb) => {
  const allowed = ['image/jpeg','image/jpg','image/png','image/webp'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only images allowed'));
};

const maxSizeKb = parseInt(process.env.PROOF_PHOTO_MAX_SIZE_KB || 400);

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeKb * 1024 },
});

module.exports = { upload };
