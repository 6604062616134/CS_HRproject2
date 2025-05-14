const db = require('../db');
const bcrypt = require('bcryptjs');

const TeacherController = {
    async getAllTeachers(req, res) {
        try {
            const teachers = await db.query('SELECT * FROM teacher ORDER BY t_name ASC');
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
        const { t_name, t_code, t_tel, t_email, t_AcademicRanks, username, password } = req.body; // รับ username และ password
        try {
            // ดึง t_ID ล่าสุดจากตาราง teacher หรือ admin
            const [latestIdResult] = await db.query(`
                SELECT MAX(t_ID) AS latestId FROM (
                    SELECT t_ID FROM teacher
                    UNION
                    SELECT t_ID FROM admin
                ) AS combined
            `);
            const latestId = latestIdResult[0]?.latestId || 0; // ถ้าไม่มีค่า ให้เริ่มต้นที่ 0
            const newId = latestId + 1; // เพิ่มค่า t_ID ใหม่

            // แฮชพาสเวิร์ดก่อนเพิ่มลงในตาราง admin
            const hashedPassword = await bcrypt.hash(password, 10); // แฮชพาสเวิร์ดด้วย bcrypt

            // เพิ่มข้อมูลลงในตาราง teacher
            const sql_params_teacher = [newId, t_name, t_code, t_tel, t_email, t_AcademicRanks];
            await db.query(
                'INSERT INTO teacher (t_ID, t_name, t_code, t_tel, t_email, t_AcademicRanks) VALUES (?, ?, ?, ?, ?, ?)',
                sql_params_teacher
            );

            // เพิ่มข้อมูลลงในตาราง admin
            const role = 'teacher'; // กำหนด role เป็น teacher
            const createdDate = new Date(); // วันที่สร้าง
            const modifiedDate = new Date(); // วันที่แก้ไขล่าสุด
            const sql_params_admin = [newId, username, hashedPassword, role, createdDate, modifiedDate];
            await db.query(
                'INSERT INTO admin (t_ID, username, password, role, createdDate, modifiedDate) VALUES (?, ?, ?, ?, ?, ?)',
                sql_params_admin
            );

            res.status(201).json({ message: 'Teacher and admin created successfully', t_ID: newId });
        } catch (error) {
            console.error('Error creating teacher and admin:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateTeacher(req, res) {
        const teacherId = req.params.id;
        const { t_name, t_code, t_tel, t_email, t_AcademicRanks, username, oldPassword, newPassword } = req.body;
        try {
            // อัปเดตข้อมูลในตาราง teacher
            const sql_params = [t_name, t_code, t_tel, t_email, t_AcademicRanks, teacherId];
            const [result] = await db.query(
                'UPDATE teacher SET t_name = ?, t_code = ?, t_tel = ?, t_email = ?, t_AcademicRanks = ? WHERE t_ID = ?',
                sql_params
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Teacher not found' });
            }

            // อัปเดต username และ/หรือ password (กรณีเปลี่ยนรหัสผ่านต้องใช้ oldPassword ด้วย)
            if (username || (oldPassword && newPassword)) {
                let updateFields = [];
                let params = [];

                if (username) {
                    updateFields.push('username = ?');
                    params.push(username);
                }

                if (oldPassword && newPassword) {
                    // ตรวจสอบรหัสผ่านเก่าก่อนอัปเดตรหัสผ่านใหม่
                    const [rows] = await db.query('SELECT password FROM admin WHERE t_ID = ?', [teacherId]);
                    if (rows.length === 0) {
                        return res.status(404).json({ error: 'Admin record not found' });
                    }

                    const isPasswordValid = await bcrypt.compare(oldPassword, rows[0].password);
                    if (!isPasswordValid) {
                        return res.status(400).json({ error: 'Old password is incorrect' });
                    }

                    const hashedPassword = await bcrypt.hash(newPassword, 10);
                    updateFields.push('password = ?');
                    params.push(hashedPassword);
                }

                if (updateFields.length > 0) {
                    params.push(teacherId);
                    await db.query(
                        `UPDATE admin SET ${updateFields.join(', ')} WHERE t_ID = ?`,
                        params
                    );
                }
            }

            res.status(200).json({ message: 'Teacher updated successfully' });
        } catch (error) {
            console.error('Error updating teacher:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteTeacher(req, res) {
        const teacherId = req.params.id;
        try {
            // ลบจาก admin ก่อน (ใช้ t_ID)
            await db.query('DELETE FROM admin WHERE t_ID = ?', [teacherId]);
            // ลบจาก teacher
            await db.query('DELETE FROM teacher WHERE t_ID = ?', [teacherId]);
            res.status(200).json({ message: 'Teacher deleted successfully' });
        } catch (error) {
            console.error('Error deleting teacher:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

}

module.exports = TeacherController;