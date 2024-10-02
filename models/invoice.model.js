const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
    bookingId: { type: String, required: true },
    invoiceData: { type: Buffer, required: true }, // For storing the PDF as binary
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);