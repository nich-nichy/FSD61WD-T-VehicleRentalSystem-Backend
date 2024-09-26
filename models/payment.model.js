
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    bookingId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    paymentMethod: String,
    paymentStatus: String,
    invoiceUrl: String
});

module.exports = mongoose.model("Payment", paymentSchema);