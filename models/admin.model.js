const mongoose = require('mongoose');

const adminTokenSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Admin' },
    token: { type: String, required: true, unique: true },
    name: String,
    createdAt: { type: Date, default: Date.now, expires: '2d' },
});

module.exports = mongoose.model('Admin', adminTokenSchema);
