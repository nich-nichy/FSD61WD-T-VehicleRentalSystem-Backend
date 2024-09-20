const vehicleSchema = new mongoose.Schema({
    make: String,
    model: String,
    year: Number,
    type: String,
    pricePerDay: Number,
    location: String,
    available: Boolean,
    images: [String],
    description: String
});
