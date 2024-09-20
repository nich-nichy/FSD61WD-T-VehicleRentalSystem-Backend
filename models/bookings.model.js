const bookingSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId, // Reference to the user
    vehicleId: mongoose.Schema.Types.ObjectId, // Reference to the vehicle
    startDate: Date,
    endDate: Date,
    status: String,
    totalPrice: Number
});
