const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getAllTeachers } = require('./teacherController');
const { get } = require('../routes/userRoute');

const UserController = {
    async login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        try {
            // ค้นหาผู้ใช้ในฐานข้อมูล
            const [rows] = await db.query('SELECT * FROM admin WHERE username = ?', [username]);

            if (rows.length === 0) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const user = rows[0];

            // ตรวจสอบ role
            if (user.role !== 'teacher' && user.role !== 'staff' && user.role !== 'superadmin') {
                return res.status(403).json({ error: 'Access denied. Invalid role' });
            }

            // ตรวจสอบรหัสผ่าน
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            // สร้าง JWT Token
            const token = jwt.sign(
                { admin_ID: user.admin_ID, username: user.username, role: user.role },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '3h' }
            );

            const datetime = new Date();
            await db.query(
                'INSERT INTO login (username, datetime, role) VALUES (?, ?, ?)',
                [username, datetime, user.role]
            );

            // ส่ง Token กลับไปใน Cookie
            res.cookie('auth_token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
            return res.status(200).json({ message: 'Login successful', role: user.role });

        } catch (error) {
            console.error('Error during login:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    async logout(req, res) {
        try {
            // ลบ Cookie ที่เก็บ Token
            res.clearCookie('auth_token');
            return res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            console.error('Error during logout:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    async createUser(req, res) {
        try {
            console.log(req.body); // ตรวจสอบว่า req.body มีข้อมูลที่ถูกต้อง
            const { username, password, role, t_ID, s_ID } = req.body;

            if (!username || !password || !role) {
                return res.status(400).json({ error: 'Username, password, and role are required' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const created = new Date();
            const modified = new Date();

            // ตรวจสอบ role และกำหนดค่า t_ID หรือ s_ID
            let teacherID = null;
            let staffID = null;

            if (role === 'teacher') {
                teacherID = t_ID || null; // ใช้ t_ID หากมีค่า หรือ NULL
            } else if (role === 'staff') {
                staffID = s_ID || null; // ใช้ s_ID หากมีค่า หรือ NULL
            }

            const sql_params = [username, hashedPassword, created, modified, role, teacherID, staffID];

            await db.query(
                `INSERT INTO admin (username, password, createdDate, modifiedDate, role, t_ID, s_ID) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                sql_params
            );

            res.status(201).json({ message: 'User created', status: 'success' });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Internal server error', status: 'error' });
        }
    },

    async getUser(req, res) {
        try {
            const { admin_ID } = req.user; // ใช้ข้อมูลจาก JWT Token
            const [rows] = await db.query('SELECT username, role FROM admin WHERE admin_ID = ?', [admin_ID]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json(rows[0]); // ส่งข้อมูลของผู้ใช้ที่ล็อกอินอยู่กลับไป
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllUsers(req, res) {
        try {
            const [rows] = await db.query('SELECT username, password, role FROM admin');
            if (rows.length === 0) {
                return res.status(404).json({ error: 'No users found' });
            }
            res.status(200).json(rows); // ส่งข้อมูลผู้ใช้ทั้งหมดกลับไป
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateUser(req, res) {
        try {
            const { admin_ID } = req.params;
            const { username, password, role } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const modified = new Date();

            const sql_params = [username, hashedPassword, modified, role, admin_ID];

            await db.query(`UPDATE admin SET username = ?, password = ?, modifiedDate = ?, role = ? WHERE admin_ID = ?`, sql_params);

            res.status(200).json({ message: 'User updated', status: 'success' });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Internal server error', status: 'error' });
        }
    },

    async deleteUser(req, res) {
        try {
            const { admin_ID } = req.params;
            await db.query('DELETE FROM admin WHERE admin_ID = ?', [admin_ID]);
            res.status(200).json({ message: 'User deleted', status: 'success' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Internal server error', status: 'error' });
        }
    },

    async getAllTeacherAccount(req, res) {
        try {
            const [rows] = await db.query('SELECT * FROM admin WHERE role = ?', ['teacher']);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'No teacher accounts found' });
            }
            res.status(200).json(rows); // ส่งข้อมูลผู้ใช้ทั้งหมดกลับไป
        } catch (error) {
            console.error('Error fetching all teacher accounts:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllStaffAccount(req, res) {
        try {
            const [rows] = await db.query('SELECT * FROM admin WHERE role = ?', ['staff']);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'No staff accounts found' });
            }
            res.status(200).json(rows); // ส่งข้อมูลผู้ใช้ทั้งหมดกลับไป
        } catch (error) {
            console.error('Error fetching all staff accounts:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async changePassword(req, res) {
        try {
            const { t_ID } = req.params;
            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                return res.status(400).json({ error: 'Old password and new password are required' });
            }

            // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
            const [rows] = await db.query('SELECT password FROM admin WHERE t_ID = ?', [t_ID]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = rows[0];

            // ตรวจสอบรหัสผ่านเดิม
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Old password is incorrect' });
            }

            // แฮชรหัสผ่านใหม่
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // อัปเดตรหัสผ่านใหม่ในฐานข้อมูล
            await db.query('UPDATE admin SET password = ? WHERE admin_ID = ?', [hashedPassword, t_ID]);

            res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Error changing password:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async createSemester(req, res) {
        try {
            const { semester } = req.body;
            if (!semester || !semester.trim()) {
                return res.status(400).json({ error: 'กรุณาระบุปีการศึกษา' });
            }

            // ตรวจสอบว่ามี semester นี้อยู่แล้วหรือยัง
            const [existRows] = await db.query('SELECT * FROM semester WHERE semester = ?', [semester.trim()]);
            if (existRows.length > 0) {
                return res.status(409).json({ error: 'ปีการศึกษานี้มีอยู่แล้ว' });
            }

            // เพิ่มข้อมูลลงตาราง semester
            await db.query('INSERT INTO semester (semester) VALUES (?)', [semester.trim()]);
            res.status(201).json({ message: 'เพิ่มปีการศึกษาสำเร็จ' });
        } catch (error) {
            console.error('Error creating semester:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllSemesters(req, res) {
        try {
            const [rows] = await db.query('SELECT * FROM semester');
            if (rows.length === 0) {
                return res.status(404).json({ error: 'No semesters found' });
            }
            res.status(200).json(rows); // ส่งข้อมูลปีการศึกษาทั้งหมดกลับไป
        } catch (error) {
            console.error('Error fetching all semesters:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = UserController;