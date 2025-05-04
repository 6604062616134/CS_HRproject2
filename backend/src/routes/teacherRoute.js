const express = require('express');
const router = express.Router();
const TeacherController = require('../controllers/teacherController');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/', authenticateToken,TeacherController.getAllTeachers);
router.get('/:id', authenticateToken,TeacherController.getTeacherById);

module.exports = router;