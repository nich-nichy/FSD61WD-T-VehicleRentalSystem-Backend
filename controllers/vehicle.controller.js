const User = require('../models/users.model');
const { APP_URL } = process.env;

module.exports.saveTempData = async (req, res) => {
    try {
        const { user, email, state, city, dateRange } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ message: "User already exists" });
        }
        const vehicle = Vehicle.create({
            user: '1',
            email,
            state,
            city,
            dateRange
        });
        res
            .status(201)
            .json({ message: "User signed in successfully", success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}