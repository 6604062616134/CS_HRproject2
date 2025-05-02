const db = require('../db');

const StaffProjectController = {
    async getAllStaffProjects(req, res) {
        try {
            const [rows] = await db.execute(`
                SELECT * from staffproject
            `);
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error fetching staff projects:', error);
            res.status(500).json({ message: 'Error fetching staff projects' });
        }
    },

    async getStaffProjectByStaffId(req, res) {
        try {
            const { s_ID } = req.params;
            const query = 'SELECT * FROM staffproject WHERE s_ID = ?';
            const [rows] = await db.execute(query, [s_ID]);
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error fetching staff project by staff ID:', error);
            res.status(500).json({ message: 'Error fetching staff project' });
        }
    },

    async getStaffProjectByStudentId(req, res) {
        try {
            const { studentID } = req.params; // รับ studentID จากพารามิเตอร์ URL
            const query = `
                SELECT * 
                FROM staffproject 
                WHERE studentID_1 = ? OR studentID_2 = ?
            `;
            const [rows] = await db.execute(query, [studentID, studentID]); // ใช้ studentID ในเงื่อนไข
            res.status(200).json(rows); // ส่งข้อมูลกลับในรูปแบบ JSON
        } catch (error) {
            console.error('Error fetching staff project by student ID:', error);
            res.status(500).json({ message: 'Error fetching staff project by student ID' });
        }
    },

    async createStaffProject(req, res) {
        try {
            const {
                studentCode1,
                studentCode2,
                FLname1,
                FLname2,
                thesisNameTH,
                thesisNameEN,
                year,
                s_name, // รับชื่อเจ้าหน้าที่โดยตรง
                MainMentor, // รับชื่ออาจารย์โดยตรง
                checked,
                note
            } = req.body;

            // เพิ่มฟิลด์ created
            const created = new Date();

            // INSERT ข้อมูลลงในตาราง staffproject
            const query = `
                INSERT INTO staffproject (
                    studentID_1, studentID_2, studentName1, studentName2,
                    thesisNameTH, thesisNameEN, year, staffName, teacherName, checked, note, created
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await db.execute(query, [
                studentCode1 || null,
                studentCode2 || null,
                FLname1 || null,
                FLname2 || null,
                thesisNameTH || null,
                thesisNameEN || null,
                year || null,
                s_name || null, // บันทึกชื่อเจ้าหน้าที่โดยตรง
                MainMentor || null, // บันทึกชื่ออาจารย์โดยตรง
                checked || null,
                note || null,
                created
            ]);

            res.status(201).json({ message: 'Staff project created successfully' });
        } catch (error) {
            console.error('Error creating staff project:', error);
            res.status(500).json({ message: 'Error creating staff project' });
        }
    },

    async updateStaffProject(req, res) {
        try {
            const { sp_ID } = req.params;
            const {
                studentID_1,
                studentID_2,
                studentName1,
                studentName2,
                thesisNameTH,
                thesisNameEN,
                year,
                staffName,
                teacherName,
                checked,
                note
            } = req.body;

            const query = `
                UPDATE staffproject
                SET studentID_1 = ?, studentID_2 = ?, studentName1 = ?, studentName2 = ?,
                    thesisNameTH = ?, thesisNameEN = ?, year = ?, staffName = ?, teacherName = ?, checked = ?, note = ?
                WHERE sp_ID = ?
            `;
            await db.execute(query, [
                studentID_1, studentID_2, studentName1, studentName2,
                thesisNameTH, thesisNameEN, year, staffName, teacherName, checked, note, sp_ID
            ]);

            res.status(200).json({ message: 'Staff project updated successfully' });
        } catch (error) {
            console.error('Error updating staff project:', error);
            res.status(500).json({ message: 'Error updating staff project' });
        }
    },

    async deleteStaffProject(req, res) {
        try {
            const { sp_ID } = req.params;
            const query = 'DELETE FROM staffproject WHERE sp_ID = ?';
            await db.execute(query, [sp_ID]);
            res.status(200).json({ message: 'Staff project deleted successfully' });
        } catch (error) {
            console.error('Error deleting staff project:', error);
            res.status(500).json({ message: 'Error deleting staff project' });
        }
    }

}

module.exports = StaffProjectController;