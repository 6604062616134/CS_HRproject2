const express = require('express');
const router = express.Router();
const TeacherController = require('../controllers/teacherController');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/', authenticateToken,TeacherController.getAllTeachers);
router.get('/:id', authenticateToken,TeacherController.getTeacherById);

router.post('/create', authenticateToken,TeacherController.createTeacher);

router.put('/update/:id', authenticateToken,TeacherController.updateTeacher);

router.delete('/delete/:id', authenticateToken,TeacherController.deleteTeacher);

// router.get('/getAllTeacherAccount', TeacherController.getAllTeacherAccount);

module.exports = router;