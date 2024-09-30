const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    vehicleId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    rateTheVehicle: Number,
    rateOurService: Number,
    OrsComment: String,
    vehicleComment: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Review", reviewSchema);