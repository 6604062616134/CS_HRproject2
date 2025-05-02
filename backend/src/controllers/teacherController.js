const db = require('../db');

const TeacherController = {
    async getAllTeachers(req, res) {
        try {
            const teachers = await db.query('SELECT * FROM teacher');
            res.json(teachers[0]); // Assuming the first element of the array contains the results
        } catch (error) {
            console.error('Error fetching teachers:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getTeacherById(req, res) {
        const teacherId = req.params.id;
        try {
            const [teacher] = await db.query('SELECT * FROM teacher WHERE t_ID = ?', [teacherId]);
            if (teacher.length === 0) {
                return res.status(404).json({ error: 'Teacher not found' });
            }
            res.json(teacher[0]);
        } catch (error) {
            console.error('Error fetching teacher:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
}

module.exports = TeacherController;