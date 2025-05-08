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

    async createTeacher(req, res) {
        const { t_name, t_code, t_tel, t_email, t_AcademicRanks } = req.body;
        try {
            const sql_params = [t_name, t_code, t_tel, t_email, t_AcademicRanks];
            await db.query('INSERT INTO teacher (t_name, t_code, t_tel, t_email, t_AcademicRanks) VALUES (?, ?, ?, ?, ?)', sql_params);
            res.status(201).json({ message: 'Teacher created successfully' });
        } catch (error) {
            console.error('Error creating teacher:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateTeacher(req, res) {
        const teacherId = req.params.id;
        const { t_name, t_code, t_tel, t_email, t_AcademicRanks } = req.body;
        try {
            const sql_params = [t_name, t_code, t_tel, t_email, t_AcademicRanks, teacherId];
            await db.query(
                'UPDATE teacher SET t_name = ?, t_code = ?, t_tel = ?, t_email = ?, t_AcademicRanks = ? WHERE t_ID = ?',
                sql_params
            );
            res.status(200).json({ message: 'Teacher updated successfully' });
        } catch (error) {
            console.error('Error updating teacher:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteTeacher(req, res) {
        const teacherId = req.params.id;
        try {
            await db.query('DELETE FROM teacher WHERE t_ID = ?', [teacherId]);
            res.status(200).json({ message: 'Teacher deleted successfully' });
        } catch (error) {
            console.error('Error deleting teacher:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // async getAllTeacherAccount(req, res) {
    //     try {
    //         console.log('Fetching all teacher accounts...'); // Log the request for debugging
    //         const query = `
    //             SELECT 
    //                 teacher.t_ID,
    //                 teacher.t_AcademicRanks,
    //                 teacher.t_name,
    //                 teacher.t_code,
    //                 teacher.t_tel,
    //                 teacher.t_email,
    //                 admin.username,
    //                 admin.password
    //             FROM teacher
    //             LEFT JOIN admin ON teacher.t_ID = admin.t_ID
    //         `;
    //         const [results] = await db.query(query);

    //         console.log('Results:', results); // Log the results for debugging
    
    //         if (!results || results.length === 0) {
    //             return res.status(404).json({ error: 'No teacher accounts found' });
    //         }
    
    //         res.status(200).json(results);
    //     } catch (error) {
    //         console.error('Error fetching teacher accounts:', error);
    //         res.status(500).json({ error: 'Internal server error' });
    //     }
    // }

}

module.exports = TeacherController;