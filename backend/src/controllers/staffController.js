const db = require('../db');
const bcrypt = require('bcryptjs');

const StaffController = {
    async getAllStaff(req, res) {
        try {
            const [rows] = await db.query(
                "SELECT * FROM staff ORDER BY TRIM(SUBSTRING_INDEX(s_name, ' ', -2)) COLLATE utf8mb4_thai_520_w2 ASC"
            );
            res.json(rows);
        } catch (error) {
            console.error('Error fetching staff:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async createStaff(req, res) {
        try {
            const { s_name, username, password } = req.body;

            // ดึง s_ID ล่าสุดจากตาราง staff
            const [latestIdResult] = await db.query('SELECT MAX(s_ID) AS latestId FROM staff');
            const latestId = latestIdResult[0]?.latestId || 0;
            const newId = latestId + 1;

            // แฮชพาสเวิร์ดก่อนเพิ่มลงในตาราง admin
            const hashedPassword = await bcrypt.hash(password, 10); // แฮชพาสเวิร์ดด้วย bcrypt

            const sql_params_staff = [newId, s_name];
            await db.query(
                'INSERT INTO staff (s_ID, s_name) VALUES (?, ?)',
                sql_params_staff
            );

            // เพิ่มข้อมูลลงในตาราง admin
            const role = 'staff'; // กำหนด role เป็น teacher
            const createdDate = new Date(); // วันที่สร้าง
            const modifiedDate = new Date(); // วันที่แก้ไขล่าสุด
            const sql_params_admin = [newId, username, hashedPassword, role, createdDate, modifiedDate];
            await db.query(
                'INSERT INTO admin (s_ID, username, password, role, createdDate, modifiedDate) VALUES (?, ?, ?, ?, ?, ?)',
                sql_params_admin
            );

            res.status(201).json({ message: 'Staff created successfully', s_ID: newId, s_name });
        } catch (error) {
            console.error('Error creating staff:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getStaffById(req, res) {
        const staffId = req.params.id;
        try {
            const [staff] = await db.query('SELECT * FROM staff WHERE s_ID = ?', [staffId]);
            if (staff.length === 0) {
                return res.status(404).json({ error: 'Staff not found' });
            }
            res.json(staff[0]);
        } catch (error) {
            console.error('Error fetching staff:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateStaff(req, res) {
        const staffId = req.params.id;
        const { s_name, username, newPassword } = req.body;

        try {
            // อัปเดตชื่อเจ้าหน้าที่ในตาราง staff
            const [result] = await db.query('UPDATE staff SET s_name = ? WHERE s_ID = ?', [s_name, staffId]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Staff not found' });
            }

            // อัปเดต username และ/หรือ password (ไม่ต้องเช็ครหัสผ่านเดิม)
            let updateFields = [];
            let params = [];

            if (username) {
                updateFields.push('username = ?');
                params.push(username);
            }

            if (newPassword) {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                updateFields.push('password = ?');
                params.push(hashedPassword);
            }

            if (updateFields.length > 0) {
                params.push(staffId);
                await db.query(
                    `UPDATE admin SET ${updateFields.join(', ')} WHERE s_ID = ?`,
                    params
                );
            }

            res.json({ id: staffId, s_name, username });
        } catch (error) {
            console.error('Error updating staff:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteStaff(req, res) {
        const staffId = req.params.id;
        try {
            // ลบจาก admin ก่อน (ใช้ s_ID)
            await db.query('DELETE FROM admin WHERE s_ID = ?', [staffId]);
            // ลบจาก staff
            const [result] = await db.query('DELETE FROM staff WHERE s_ID = ?', [staffId]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Staff not found' });
            }
            res.json({ message: 'Staff deleted successfully' });
        } catch (error) {
            console.error('Error deleting staff:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
}
module.exports = StaffController;