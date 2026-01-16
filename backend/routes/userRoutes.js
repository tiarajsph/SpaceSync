// ===== userRoutes.js (New) =====
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate } = require("../middleware/auth");

// Get own role info (any authenticated user)
router.get("/me", authenticate, adminController.getMyRole);

module.exports = router;
