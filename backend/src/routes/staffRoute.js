const express = require('express');
const router = express.Router();
const StaffController = require('../controllers/staffController');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/', authenticateToken,StaffController.getAllStaff);
router.get('/:id', authenticateToken,StaffController.getStaffById);

router.post('/create', authenticateToken, StaffController.createStaff);

router.put('/update/:id', authenticateToken, StaffController.updateStaff);

router.delete('/delete/:id', authenticateToken, StaffController.deleteStaff);

module.exports = router;