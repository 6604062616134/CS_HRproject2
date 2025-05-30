const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');

// Public route (ไม่ต้องล็อกอิน)
router.post('/login', UserController.login);

// Protected routes (ต้องล็อกอิน)
router.post('/createUser',authenticateToken, UserController.createUser);
router.post('/logout', authenticateToken, UserController.logout);
router.post('/createsemester', authenticateToken, UserController.createSemester);
router.post('/createReport', authenticateToken, UserController.createReport);

router.put('/updateUser/:id', authenticateToken, UserController.updateUser);
router.put('/changePassword/:t_ID', authenticateToken, UserController.changePassword);
router.put('/updateReport/:r_ID', authenticateToken, UserController.updateReport);

router.delete('/deleteUser/:id', authenticateToken, UserController.deleteUser);
router.delete('/deleteSemester/:y_ID', authenticateToken, UserController.deleteSemester);
router.delete('/deleteReport/:r_ID', authenticateToken, UserController.deleteReport);

router.get('/getUser', authenticateToken, UserController.getUser);
router.get('/getAllUser', authenticateToken, UserController.getAllUsers);
router.get('/getAllTeacherAccount', authenticateToken, UserController.getAllTeacherAccount);
router.get('/getAllStaffAccount', authenticateToken, UserController.getAllStaffAccount);
router.get('/getAllsemester', authenticateToken, UserController.getAllSemesters);
router.get('/getAllreport', authenticateToken, UserController.getAllReport);

module.exports = router;