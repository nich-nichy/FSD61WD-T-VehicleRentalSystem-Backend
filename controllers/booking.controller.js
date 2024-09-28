const Booking = require('../models/bookings.model');
const Vehicle = require('../models/vehicle.model');
const mongoose = require('mongoose');
const { APP_URL } = process.env;
const cron = require('node-cron');

module.exports.saveTempData = async (req, res) => {
    try {
        const { userId, vehicleId, user, email, state, city, startDate, endDate } = req.body;
        const alreadyPreBooked = await Booking.findOne({ user });
        if (alreadyPreBooked) {
            return res.json({ message: "You have aleady pre booked, Just proceed to choose car and pay" });
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
        const getBooking = await Booking.findOne({ _id: id })
        const getVehicleId = await Vehicle.findOne({ _id: getBooking.vehicleId })
        const changeVehicleAvailability = await Vehicle.updateOne({ _id: getVehicleId }, { $set: { isAvailable: true } });
        const deleteBooking = await Booking.deleteOne({ _id: id });
        console.log({ deleteBooking })
        res.status(200).json({ message: "Booking has been deleted succefully", deleteBooking });
    } catch (error) {
        console.error("Error fetching pre booking:", error);
        res.status(500).json({ message: error.message });
    }
}

module.exports.getBookingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const bookingDetails = await Booking.find({ userId: id });
        if (!bookingDetails.length) {
            return res.status(404).json({ message: "No bookings found!" });
        }
        const bookingInfo = await Promise.all(
            bookingDetails.map(async (booking) => {
                if (!booking.vehicleId) {
                    return {
                        ...booking._doc,
                        vehicleDetails: ''
                    };
                }
                const vehicleDetails = await Vehicle.findById(booking.vehicleId);
                return {
                    ...booking._doc,
                    vehicleDetails: vehicleDetails || ''
                };
            })
        );
        bookingInfo.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        console.log(bookingInfo);
        res.status(200).json({
            message: "Booking details fetched successfully",
            bookingInfo
        });
    } catch (error) {
        console.error("Error fetching booking details:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// module.exports.updateBooking = async (req, res) => {
//     try {
//         const { bookingId, userId, vehicleId, user, email, state, city, startDate, endDate, status, totalAmount, totalPrice } = req.body;
//         const bookVehicle = await Booking.findOneAndUpdate(
//             { _id: bookingId },
//             {
//                 userId,
//                 vehicleId,
//                 user,
//                 email,
//                 state,
//                 city,
//                 startDate,
//                 endDate,
//                 status,
//                 totalAmount
//             },
//             { new: true }
//         );
//         if (!bookVehicle) {
//             return res.status(404).json({ message: "Booking not found" });
//         }
//         const vehicle = await Vehicle.findOneAndUpdate(
//             { _id: vehicleId },
//             { $set: { onRoadFrom: startDate, onRoadTo: endDate, availability: 'on road' } }, // Set on road
//             { new: true }
//         );
//         if (!vehicle) {
//             return res.status(404).json({ message: "Vehicle not found" });
//         }
//         const endDateTime = new Date(endDate).getTime();
//         const currentTime = new Date().getTime();
//         const delay = endDateTime - currentTime;

//         if (delay > 0) {
//             setTimeout(async () => {
//                 try {
//                     await Vehicle.findOneAndUpdate(
//                         { _id: vehicleId },
//                         { $set: { availability: 'available', onRoadFrom: null, onRoadTo: null } }
//                     );
//                     console.log(`Vehicle ${vehicleId} is now available`);
//                 } catch (error) {
//                     console.error("Error updating vehicle status:", error);
//                 }
//             }, delay);
//         }

//         // cron.schedule('*/1 * * * *', async () => {
//         //     const vehiclesOnRoad = await Vehicle.find({ onRoadTo: { $lte: new Date() } });
//         //     for (const v of vehiclesOnRoad) {
//         //         await Vehicle.updateOne({ _id: v._id }, { availability: 'available', onRoadFrom: null, onRoadTo: null });
//         //         console.log(`Vehicle ${v._id} is now available`);
//         //     }
//         // });



//         res.status(200).json({
//             message: "Booking updated successfully",
//             bookingInfo: bookVehicle
//         });
//     } catch (error) {
//         console.error("Error updating booking:", error);
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// };

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
        const startDateTime = new Date(startDate).getTime();
        const endDateTime = new Date(endDate).getTime();
        const currentTime = new Date().getTime();
        let availableStatus = false;
        let onRoadFrom = startDate;
        let onRoadTo = endDate;
        if (endDateTime < currentTime) {
            availableStatus = true;
            onRoadFrom = null;
            onRoadTo = null;
        }
        const vehicle = await Vehicle.findOneAndUpdate(
            { _id: vehicleId },
            {
                $set: {
                    onRoadFrom,
                    onRoadTo,
                    available: availableStatus
                }
            },
            { new: true }
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
