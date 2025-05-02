const express = require('express');
const router = express.Router();
const AssignationController = require('../controllers/assignationController');
const { authenticateToken } = require('../middleware/authenticateToken');

// Protected routes (ต้องล็อกอิน)
router.get('/:id', authenticateToken, AssignationController.getAssignationById);
router.get('/getAll', authenticateToken, AssignationController.getAllAssignation);
router.get('/getByIds', authenticateToken, AssignationController.getAssignationByIds);

router.post('/create', authenticateToken, AssignationController.createAssignation);

router.delete('/delete/:id', authenticateToken, AssignationController.deleteAssignation);

router.put('/update/:id', authenticateToken, AssignationController.updateAssignation);

module.exports = router;