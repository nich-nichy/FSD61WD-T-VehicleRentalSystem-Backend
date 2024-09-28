const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const mongoose = require('mongoose');
const generateAdminToken = (admin) => {
    return jwt.sign(admin, process.env.ADMIN_SECRET, { expiresIn: '2d' });
};

module.exports.checkAdmin = async (req, res) => {
    try {
        const { adminId } = req.body;
        const admin = await Admin.findOne({ _id: adminId });
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        const token = generateAdminToken({ _id: admin._id });
        await Admin.findOneAndUpdate(
            { _id: admin._id },
            { token: token },
            { new: true }
        );
        res.status(200).json({ success: true, message: 'Login successful', adminToken: token });
    } catch (error) {
        console.error('Error logging in admin: ', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
