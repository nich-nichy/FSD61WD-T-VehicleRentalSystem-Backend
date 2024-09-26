const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    vehicleId: mongoose.Schema.Types.ObjectId,
    startDate: Date,
    endDate: Date,
    status: String,
    totalPrice: Number
});

module.exports = mongoose.model("Booking", bookingSchema);