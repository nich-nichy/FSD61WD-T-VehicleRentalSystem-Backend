const Booking = require('../models/bookings.model');
const mongoose = require('mongoose');
const { APP_URL } = process.env;

module.exports.saveTempData = async (req, res) => {
    try {
        const { userId, vehicleId, user, email, state, city, startDate, endDate } = req.body;
        const alreadyPreBooked = await Booking.findOne({ user });
        if (alreadyPreBooked) {
            return res.json({ message: "You have aleady pre booked, Just proceed to choose car and pay" });
        }
        const booking = await Booking.create({
            userId,
            vehicleId,
            user,
            email,
            state,
            city,
            startDate,
            endDate,
            status: false,
            totalPrice: 0
        });
        console.log(booking);
        res
            .status(201)
            .json({ message: "Pre book success", success: true, booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports.totalPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const fetchUser = await Booking.findOne({ userId: id });
        console.log(fetchUser);
        if (!fetchUser) {
            return res.status(404).json({ message: "Pre Booking not found", success: false });
        }
        console.log(fetchUser);
        res.status(200).json({ message: "Total Price is complete", success: true, booking: fetchUser });
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports.getPreBookDetails = async (req, res) => {
    try {
        const { user } = req.body;
        const alreadyPreBooked = await Booking.findOne({ user });
        if (alreadyPreBooked) {
            return res.json({ message: "You have aleady pre booked, Just proceed to choose car and pay", preBookDetails: alreadyPreBooked });
        }
    } catch (error) {
        console.error("Error fetching pre booking:", error);
        res.status(500).json({ message: error.message });
    }
}
