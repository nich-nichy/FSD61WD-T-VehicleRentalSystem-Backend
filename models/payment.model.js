
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    bookingId: mongoose.Schema.Types.ObjectId,
    status: Boolean,
    amount: Number,
    paymentMethod: String,
    paymentStatus: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Payment", paymentSchema);