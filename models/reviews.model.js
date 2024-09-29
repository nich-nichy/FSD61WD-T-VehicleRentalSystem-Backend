const reviewSchema = new mongoose.Schema({
    vehicleId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    reviewText: String,
    approved: Boolean,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
