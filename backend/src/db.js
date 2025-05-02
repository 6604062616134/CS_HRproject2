require('dotenv').config();
const mysql = require('mysql2/promise');

// const pool = mysql.createPool({
//     host: process.env.DB_HOST, // ชื่อ host (db)
//     user: process.env.DB_USER, // ชื่อผู้ใช้ (root)
//     password: process.env.DB_PASSWORD, // รหัสผ่าน (root)
//     database: process.env.DB_NAME, // ชื่อฐานข้อมูล (boardgames)
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// // ทดสอบการเชื่อมต่อ
// (async () => {
//     try {
//         const connection = await pool.getConnection();
//         console.log('Connected to the database successfully!');
//         connection.release();
//     } catch (error) {
//         console.error('Error connecting to the database:', error);
//     }
// })();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hr_cskmutnb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;