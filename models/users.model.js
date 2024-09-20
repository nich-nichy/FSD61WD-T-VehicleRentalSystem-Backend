const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    bookings: [mongoose.Schema.Types.ObjectId],
    reviews: [mongoose.Schema.Types.ObjectId],
    isAdmin: Boolean
});
