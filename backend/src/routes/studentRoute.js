const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/studentController');
const { authenticateToken } = require('../middleware/authenticateToken');

router.get('/all', authenticateToken,StudentController.getAllstudent);
router.post('/create', authenticateToken,StudentController.createstudentthesisinfo);
router.put('/update/:id', authenticateToken,StudentController.updatestudentthesisinfo);
router.delete('/delete/:id', authenticateToken,StudentController.deletestudentthesisinfo);

module.exports = router;