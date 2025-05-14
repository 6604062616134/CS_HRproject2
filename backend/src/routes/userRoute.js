const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');

// Public route (ไม่ต้องล็อกอิน)
router.post('/login', UserController.login);

// Protected routes (ต้องล็อกอิน)
router.post('/createUser',authenticateToken, UserController.createUser);
router.post('/logout', authenticateToken, UserController.logout);

router.get('/getUser', authenticateToken, UserController.getUser);

router.get('/getAllUser', authenticateToken, UserController.getAllUsers);

router.put('/updateUser/:id', authenticateToken, UserController.updateUser);
router.put('/changePassword/:t_ID', authenticateToken, UserController.changePassword);

router.delete('/deleteUser/:id', authenticateToken, UserController.deleteUser);

router.get('/getAllTeacherAccount', authenticateToken, UserController.getAllTeacherAccount);
router.get('/getAllStaffAccount', authenticateToken, UserController.getAllStaffAccount);

module.exports = router;