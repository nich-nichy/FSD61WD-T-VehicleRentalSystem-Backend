const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Your email address is required"],
        unique: true,
    },
    username: {
        type: String,
        required: [true, "Your username is required"],
    },
    password: {
        type: String,
        required: [true, "Your password is required"],
    },
    resetToken: String,
    resetTokenExpiration: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    bookings: [mongoose.Schema.Types.ObjectId],
    reviews: [mongoose.Schema.Types.ObjectId],
    image: String,
    isAdmin: Boolean
});

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

module.exports = mongoose.model("User", userSchema);