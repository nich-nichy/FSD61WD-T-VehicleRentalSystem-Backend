const userSchema = require("../models/users.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");


module.exports.userVerification = (req, res) => {
    const token = req.body.token;
    if (!token) {
        return res.status(401).json({ status: false, message: 'No token provided' });
    }
    jwt.verify(token, process.env.TOKEN_KEY, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ status: false, message: 'Invalid token' });
        }
        try {
            const user = await userSchema.findById(decoded.id);
            if (!user) {
                return res.status(404).json({ status: false, message: 'User not found' });
            }
            const isAdmin = user.isAdmin;
            return res.status(200).json({
                id: user._id.toString(),
                status: true,
                user: user.username,
                email: user.email,
                role: isAdmin
            });
        } catch (error) {
            console.error("Error fetching user:", error);
            return res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    });
};
