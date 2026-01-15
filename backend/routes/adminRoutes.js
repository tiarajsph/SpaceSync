// ===== adminRoutes.js =====
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(authorize('admin'));

router.post('/assign-role', adminController.assignRole);
router.post('/revoke-role', adminController.revokeRole);
router.get('/users', adminController.listUsers);

module.exports = router;
