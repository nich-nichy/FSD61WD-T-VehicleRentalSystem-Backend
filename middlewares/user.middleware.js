const userSchema = require("../models/user.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = (req, res) => {
    const token = req.body.token
    if (!token) {
        return res.json({ status: false })
    }
    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
        if (err) {
            return res.json({ status: false })
        } else {
            const user = await userSchema.findById(data.id)
            if (user) return res.json({ status: true, user: user.username })
            else return res.json({ status: false })
        }
    })
}