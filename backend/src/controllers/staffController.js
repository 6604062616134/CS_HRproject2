const db = require('../db');

const StaffController = {
    async getAllStaff(req, res) {
        try {
            const [rows] = await db.query('SELECT * FROM staff');
            res.json(rows); // Assuming the first element of the array contains the results
        } catch (error) {
            console.error('Error fetching staff:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async createStaff(req, res) {
        try {
            const { name, position } = req.body;
            const [result] = await db.query('INSERT INTO staff (name, position) VALUES (?, ?)', [name, position]);
            res.status(201).json({ id: result.insertId, name, position });
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
    }
}
module.exports = StaffController;