const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    vehicleName: String,
    model: String,
    year: Number,
    type: String,
    pricePerDay: Number,
    location: String,
    available: Boolean,
    images: [String],
    description: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);