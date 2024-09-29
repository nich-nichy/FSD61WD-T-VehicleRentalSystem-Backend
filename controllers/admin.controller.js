const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const Booking = require('../models/bookings.model');
const Vehicle = require('../models/vehicle.model');
const Payment = require('../models/payment.model');
const User = require('../models/users.model');

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

module.exports.getDashboardData = async (req, res) => {
    try {
        const vehicleDetails = await Vehicle.find({});
        const bookingDetails = await Booking.find({});
        const paymentDetails = await Payment.find({});
        const userDetails = await User.find({});
        // const reviewDetails = await Review.find({});
        res.status(200).json({
            message: "Data fetched successfully",
            dashboardData: {
                vehicles: vehicleDetails,
                bookings: bookingDetails,
                payments: paymentDetails,
                users: userDetails,

            }
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

