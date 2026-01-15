// ===== timetableRoutes.js (Updated) =====
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const {
  uploadAndParseTimetable
} = require('../controllers/timetableController');

// Admin only
router.post(
  '/upload',
  authenticate,
  authorize('admin'),
  upload.single('file'),
  uploadAndParseTimetable
);

module.exports = router;