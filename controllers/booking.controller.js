const Booking = require('../models/bookings.model');
const { APP_URL } = process.env;

module.exports.saveTempData = async (req, res) => {
    try {
        const { user, email, state, city, dateRange } = req.body;
        const existingUser = await Booking.findOne({ user });
        if (existingUser) {
            return res.json({ message: "User already exists" });
        }
        const booking = Booking.create({
            user,
            email,
            state,
            city,
            dateRange
        });
        console.log(booking);
        res
            .status(201)
            .json({ message: "Pre book success", success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}