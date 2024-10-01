const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { createSecretToken } = require("../utils/SecretToken");
const User = require('../models/users.model');
const { userVerification } = require("../middlewares/user.middleware")

module.exports.checkUserFunction = async (req, res) => {
    try {
        const { email } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(200).json({ message: "User is present", status: true });
        } else {
            res.status(200).json({ message: "User is not present", status: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports.SignupFunction = async (req, res, next) => {
    try {
        const { email, password, username, createdAt } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ message: "User already exists" });
        }
        const user = await User.create({ email, password, username, createdAt });
        const token = createSecretToken(user._id);
        res
            .status(201)
            .json({ message: "User signed in successfully", success: true, user, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.LoginFunction = async (req, res, next) => {
    try {
        const { email, password, isAdmin } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const query = isAdmin ? { email, isAdmin: true } : { email };
        const user = await User.findOne(query);
        if (!user || (isAdmin && !user.isAdmin)) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = createSecretToken(user._id);
        return res.status(200).json({
            message: `Logged in successfully`,
            success: true,
            token
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.PasswordResetFunction = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });
        const resetLink = `${process.env.APP_URL}/reset-password/${resetToken}`;
        await transporter.sendMail({
            to: email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset (ORS test)',
            html: `<p>You requested a password reset</p>
               <p>Click this <a href="${resetLink}">link</a> to reset your password</p>
               <p>This is a task </p>`
        });
        res.status(200).json({ message: 'Password reset link sent!' });
    } catch (error) {
        res.send(error);
    }
}

module.exports.UpdatePasswordFunction = async (req, res, next) => {
    try {
        const { newPassword } = req.body;
        const { token } = req.params;
        const user = await User.findOne({ resetToken: token });
        if (!user) {
            return res.status(404).json({ message: 'Invalid or expired reset token' });
        }
        if (user.resetTokenExpiration < Date.now()) {
            return res.status(400).json({ message: 'Reset token has expired' });
        }
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();
        res.status(200).json({ message: 'Password updated successfully', success: true });
    } catch (error) {
        console.error("Error during saving new password:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.updateUser = async (req, res, next) => {
    try {
        const { newPassword } = req.body;
        const { token } = req.params;
        const user = await User.findOne({ resetToken: token });
        if (!user) {
            return res.status(404).json({ message: 'Invalid or expired reset token' });
        }
        if (user.resetTokenExpiration < Date.now()) {
            return res.status(400).json({ message: 'Reset token has expired' });
        }
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();
        res.status(200).json({ message: 'Password updated successfully', success: true });
    } catch (error) {
        console.error("Error during saving new password:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.updateUserProfile = async (req, res, next) => {
    try {
        const { name, email, profilePicture } = req.body;
        const user = await User.findOneAndUpdate(
            { username: name },
            { username: name, email: email, image: profilePicture }
        );
        await user.save();
        res.status(200).json({ message: 'User details saved', success: true });
    } catch (error) {
        console.error("Error during saving User details", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

