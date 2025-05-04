const db = require('../db');

const StudentController = {
    async getAllstudent(req, res) {
        try {
            const students = await db.query('SELECT * FROM thesis');
            res.json(students[0]); // Assuming the first element of the array contains the results
        } catch (error) {
            console.error('Error fetching students:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async createstudentthesisinfo(req, res) {
        try {
            const {
                datetime,
                thesisnameTH,
                thesisnameEN,
                studentCode1,
                studentCode2,
                FLname1,
                FLname2,
                chairman,
                director,
                MainMentor,
                CoMentor,
                year,
                room,
                grade,
                note,
            } = req.body;

            await db.query(
                'INSERT INTO thesis (datetime, thesisnameTH, thesisnameEN, studentCode1, studentCode2, FLname1, FLname2, chairman, director, MainMentor, CoMentor, year, room, grade, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [datetime, thesisnameTH, thesisnameEN, studentCode1, studentCode2, FLname1, FLname2, chairman, director, MainMentor, CoMentor, year, room, grade, note]
            );

            res.status(200).json({ message: 'Student thesis info created successfully' });
        } catch (error) {
            console.error('Error creating student thesis info:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updatestudentthesisinfo(req, res) {
        try {
            const studentId = req.params.id; // รับ ID จาก URL
            const fields = req.body;

            const keys = Object.keys(fields);
            if (keys.length === 0) {
                return res.status(400).json({ error: 'No fields provided for update' });
            }

            const setClause = keys.map((key) => `${key} = ?`).join(', ');
            const values = keys.map((key) => fields[key]);

            values.push(studentId); // เพิ่ม studentId เป็นค่าพารามิเตอร์สุดท้าย

            // เปลี่ยน id เป็น thesisID หรือชื่อคอลัมน์ที่ถูกต้อง
            const query = `UPDATE thesis SET ${setClause} WHERE thesisID = ?`;
            await db.query(query, values);

            res.status(200).json({ message: 'Student thesis info updated successfully' });
        } catch (error) {
            console.error('Error updating student thesis info:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deletestudentthesisinfo(req, res) {
        try {
            const studentId = req.params.id; // รับ ID จาก URL

            await db.query('DELETE FROM thesis WHERE thesisID = ?', [studentId]);

            res.status(200).json({ message: 'Student thesis info deleted successfully' });
        } catch (error) {
            console.error('Error deleting student thesis info:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = StudentController;