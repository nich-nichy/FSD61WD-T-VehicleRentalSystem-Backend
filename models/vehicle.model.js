const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    make: String,
    model: String,
    year: Number,
    type: String,
    pricePerDay: Number,
    location: String,
    available: Boolean,
    images: [String],
    description: String,
    vehicleStatus: {
        bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        onRoadFrom: Date,
        onRoadTo: Date,
        available: Boolean,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;
