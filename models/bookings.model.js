const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userId: String,
    vehicleId: String,
    user: String,
    email: String,
    state: String,
    city: String,
    startDate: Date,
    endDate: Date,
    status: String,
    totalPrice: Number,
    totalAmount: Number,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Booking", bookingSchema);