const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const AppError = require('../utils/AppError');

const uploadRoot = path.resolve(__dirname, '../../uploads');

const issueUploadDir = path.join(uploadRoot, 'issues');
const resolutionUploadDir = path.join(uploadRoot, 'resolutions');

fs.mkdirSync(issueUploadDir, { recursive: true });
fs.mkdirSync(resolutionUploadDir, { recursive: true });

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

const allowedExtensions = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp'
]);

const maxFileSizeMb = Number(
  process.env.MAX_IMAGE_SIZE_MB || 5
);

const maxFiles = Number(
  process.env.MAX_IMAGES_PER_ISSUE || 5
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destination =
      req.uploadPurpose === 'resolution'
        ? resolutionUploadDir
        : issueUploadDir;

    cb(null, destination);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const safeExtension = allowedExtensions.has(extension)
      ? extension
      : '.bin';

    const uniqueName =
      `${Date.now()}-${crypto.randomBytes(16).toString('hex')}${safeExtension}`;

    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    !allowedMimeTypes.has(file.mimetype) ||
    !allowedExtensions.has(extension)
  ) {
    return cb(
      new AppError(
        'Only JPG, PNG, and WebP image files are allowed',
        400
      )
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024,
    files: maxFiles,
    fields: 20,
    parts: maxFiles + 20
  }
});

const handleUploadError = (error, req, res, next) => {
  if (!error) {
    return next();
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(
        new AppError(
          `Each image must be ${maxFileSizeMb} MB or smaller`,
          400
        )
      );
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return next(
        new AppError(
          `You can upload a maximum of ${maxFiles} images`,
          400
        )
      );
    }

    return next(
      new AppError(
        `Image upload failed: ${error.message}`,
        400
      )
    );
  }

  next(error);
};

const uploadIssueImages = (req, res, next) => {
  req.uploadPurpose = 'issue';

  upload.array('images', maxFiles)(
    req,
    res,
    (error) => {
      handleUploadError(error, req, res, next);
    }
  );
};

const uploadResolutionImages = (req, res, next) => {
  req.uploadPurpose = 'resolution';

  upload.array('resolutionImages', maxFiles)(
    req,
    res,
    (error) => {
      handleUploadError(error, req, res, next);
    }
  );
};

const getPublicFileUrl = (req, file) => {
  const folder =
    req.uploadPurpose === 'resolution'
      ? 'resolutions'
      : 'issues';

  const baseUrl = (
    process.env.PUBLIC_API_URL ||
    `${req.protocol}://${req.get('host')}`
  ).replace(/\/$/, '');

  return `${baseUrl}/uploads/${folder}/${file.filename}`;
};

module.exports = {
  uploadIssueImages,
  uploadResolutionImages,
  getPublicFileUrl,
  maxFiles,
  maxFileSizeMb,
  uploadRoot
};