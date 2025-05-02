const express = require('express');
const router = express.Router();
const StaffController = require('../controllers/staffController');
const { authenticateToken } = require('../middleware/authenticateToken');

router.get('/', authenticateToken,StaffController.getAllStaff);
router.get('/:id', authenticateToken,StaffController.getStaffById);

module.exports = router;