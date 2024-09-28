const Booking = require('../models/bookings.model');
const Vehicle = require('../models/vehicle.model');
const mongoose = require('mongoose');
const { APP_URL } = process.env;
const cron = require('node-cron');

module.exports.saveTempData = async (req, res) => {
    try {
        const { userId, vehicleId, user, email, state, city, startDate, endDate, mode } = req.body;
        const alreadyPreBooked = await Booking.findOne({ user });
        if (mode === "addMore" && alreadyPreBooked) {
            return res.json({ message: "Ok sit tight, Currently we support one user - one renting system, We are working to make multiple bookings for a user", mode: "addMore" });
        } else if (alreadyPreBooked) {
            return res.json({ message: "Already booked, Just proceed to your car and pay" });
        }
        const booking = await Booking.create({
            userId,
            vehicleId,
            user,
            email,
            state,
            city,
            startDate,
            endDate,
            status: false,
            totalPrice: 0
        });
        console.log(booking);
        res
            .status(201)
            .json({ message: "Pre book success", success: true, booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports.totalPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const fetchUser = await Booking.findOne({ userId: id });
        console.log(fetchUser);
        if (!fetchUser) {
            return res.status(404).json({ message: "Pre Booking not found", success: false });
        }
        console.log(fetchUser);
        res.status(200).json({ message: "Total Price is complete", success: true, booking: fetchUser });
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports.getPreBookDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const alreadyPreBooked = await Booking.findOne({ userId: id });
        if (alreadyPreBooked) {
            res.status(200).json({ message: "You have aleady pre booked, Just proceed to choose car and pay", preBookDetails: alreadyPreBooked });
        } else {
            res.status(200).json({ message: "No pre book found", preBookDetails: alreadyPreBooked });
        }
    } catch (error) {
        console.error("Error fetching pre booking:", error);
        res.status(500).json({ message: error.message });
    }
}

module.exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const getBooking = await Booking.findOne({ _id: id });
        if (!getBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (getBooking.vehicleId) {
            const getVehicleId = getBooking.vehicleId;
            const getVehicle = await Vehicle.findOne({ _id: getVehicleId });
            if (!getVehicle) {
                return res.status(404).json({ message: "Vehicle not found" });
            }
            const changeVehicleAvailability = await Vehicle.updateOne(
                { _id: getVehicleId },
                {
                    $set: {
                        'vehicleStatus.available': true,
                        'vehicleStatus.bookedBy': null,
                        "vehicleStatus.onRoadFrom": null,
                        "vehicleStatus.onRoadTo": null
                    }
                }
            );
            if (changeVehicleAvailability.nModified === 0) {
                return res.status(400).json({ message: "Failed to update vehicle availability" });
            }
        }
        const deleteBooking = await Booking.deleteOne({ _id: id });
        if (deleteBooking.deletedCount === 0) {
            return res.status(400).json({ message: "Failed to delete booking" });
        }
        res.status(200).json({
            message: "Booking has been deleted successfully",
            deleteBooking
        });
    } catch (error) {
        console.error("Error canceling booking:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports.getBookingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const bookingDetails = await Booking.find({ userId: id });
        if (!bookingDetails.length) {
            return res.status(404).json({ message: "No bookings found!" });
        }
        const bookingInfo = await Promise.all(
            bookingDetails.map(async (booking) => {
                if (booking?.totalAmount && booking?.startDate && booking?.endDate) {
                    const vehicleDetails = await Vehicle.findById(booking.vehicleId);
                    return {
                        ...booking._doc,
                        vehicleDetails: vehicleDetails || '',
                        message: "You have already rented a vehicle, Want to rent more ?"
                    };
                }
                return {
                    ...booking._doc,
                    vehicleDetails: ''
                };
            })
        );
        bookingInfo.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        res.status(200).json({
            message: "Booking details fetched successfully",
            bookingInfo
        });
    } catch (error) {
        console.error("Error fetching booking details:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports.updateBooking = async (req, res) => {
    try {
        const {
            bookingId, userId, vehicleId, user, email, state, city, startDate, endDate, status, totalAmount
        } = req.body;
        const bookVehicle = await Booking.findOneAndUpdate(
            { _id: bookingId },
            {
                userId,
                vehicleId,
                user,
                email,
                state,
                city,
                startDate,
                endDate,
                status,
                totalAmount
            },
            { new: true }
        );
        if (!bookVehicle) {
            return res.status(404).json({ message: "Booking not found" });
        }
        let availableStatus = false;
        let onRoadFrom = startDate;
        let onRoadTo = endDate;
        const vehicle = await Vehicle.findOneAndUpdate(
            { _id: vehicleId },
            {
                $set: {
                    "vehicleStatus.bookedBy": userId,
                    "vehicleStatus.onRoadFrom": onRoadFrom,
                    "vehicleStatus.onRoadTo": onRoadTo,
                    "vehicleStatus.available": availableStatus
                }
            },
            { new: true, upsert: true }
        );

        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        console.log(vehicle, "Vehicle data after update");
        res.status(200).json({
            message: "Booking updated successfully",
            bookingInfo: bookVehicle
        });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

