const express = require('express');
const router = express.Router();
const StaffProjectController = require('../controllers/staffProjectController');
const { authenticateToken } = require('../middleware/authenticateToken');

router.get('/getall', authenticateToken,StaffProjectController.getAllStaffProjects);
router.get('/getByStaffId', authenticateToken,StaffProjectController.getStaffProjectByStaffId);
router.get('/getByStudentId', authenticateToken,StaffProjectController.getStaffProjectByStudentId);

router.post('/create', authenticateToken,StaffProjectController.createStaffProject);
router.post('/update/:sp_ID', authenticateToken,StaffProjectController.updateStaffProject);

router.delete('/delete/:sp_ID', authenticateToken,StaffProjectController.deleteStaffProject);

module.exports = router;