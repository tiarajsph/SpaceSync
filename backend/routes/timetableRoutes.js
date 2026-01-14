const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage()
});

const {
  uploadAndParseTimetable
} = require('../controllers/timetableController');

router.post(
  '/upload',
  upload.single('file'), // 🔴 THIS IS REQUIRED
  uploadAndParseTimetable
);

module.exports = router;
