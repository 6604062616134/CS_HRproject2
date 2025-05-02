const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authenticateToken');

// Public route (ไม่ต้องล็อกอิน)
router.post('/login', UserController.login);

// Protected routes (ต้องล็อกอิน)
router.post('/createUser', authenticateToken, UserController.createUser);
router.post('/logout', authenticateToken, UserController.logout);
router.get('/getUser', authenticateToken, UserController.getUser);
router.get('/getAllUser', authenticateToken, UserController.getAllUsers);
router.put('/updateUser/:id', authenticateToken, UserController.updateUser);
router.delete('/deleteUser/:id', authenticateToken, UserController.deleteUser);

module.exports = router;