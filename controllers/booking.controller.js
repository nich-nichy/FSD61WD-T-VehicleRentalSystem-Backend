const Booking = require('../models/bookings.model');
const Vehicle = require('../models/vehicle.model');
const Payment = require('../models/payment.model');
const Review = require('../models/review.model');
const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS } = process.env;

module.exports.saveTempData = async (req, res) => {
    try {
        const { userId, vehicleId, user, email, state, city, startDate, endDate, mode, createdAt, totalAmount } = req.body;
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
            totalPrice: 0,
            createdAt,
            totalAmount
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
        let getVehicle;
        let getEmail;
        if (getBooking.vehicleId) {
            const getVehicleId = getBooking.vehicleId;
            getEmail = getBooking?.email
            getVehicle = await Vehicle.findOne({ _id: getVehicleId });
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
        const sendCancelEmail = async () => {
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: EMAIL_USER,
                    pass: EMAIL_PASS,
                },
            });
            await transporter.sendMail({
                to: getEmail,
                from: EMAIL_USER,
                subject: 'ORS - Your rental partner',
                html: `
                    <p>Hello user!</p>
                    <p>You have cancelled the car. Your amount will be refunded once our admin checks the vehicle.</p>
                    <p>Once confirmed the refund process will be take upto 2-3 business days.</p>
                    <p>Thanks and regards - Team ORS</p>
                    <span>Note: All the amounts and credentials are samples for development purposes.</span>
                `
            });
        }
        if (getVehicle) {
            sendCancelEmail();
        }
        res.status(200).json({
            message: "Booking has been cancelled successfully",
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
            return res.status(200).json({ message: "No bookings found!" });
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
            bookingId, userId, vehicleId, user, email, state, city, startDate, endDate, status, totalAmount, createdAt
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
                totalAmount,
                createdAt
            },
            { new: true }
        );
        let vehicle;
        if (!bookVehicle) {
            return res.status(404).json({ message: "Booking not found" });
        }
        let availableStatus = false;
        let onRoadFrom = startDate;
        let onRoadTo = endDate;

        if (vehicleId) {
            vehicle = await Vehicle.findOneAndUpdate(
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
        }

        // if (!vehicle) {
        //     return res.status(404).json({ message: "Vehicle not found" });
        // }
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

// module.exports.getDashboardData = async (req, res) => {
//     try {
//         const { id } = req.params;
//         let dashboardData = {};
//         const bookingDetails = await Booking.find({ userId: id });

//         console.log(bookingDetails, "Booking details");
//         const bookingArr = [];
//         const paymentArr = [];
//         let vehicleObj = {};
//         for (const booking of bookingDetails) {
//             const bookingId = booking._id;
//             const paymentDetails = await Payment.find({ bookingId: bookingId });
//             console.log(paymentDetails, "Payment details");
//             const vehicleDetail = await Vehicle.findById({ _id: booking.vehicleId });
//             paymentArr.push(paymentDetails);
//             bookingArr.push({
//                 ...booking._doc,
//                 bookingId: booking._id
//             });
//             vehicleObj = {
//                 ...vehicleDetail?._doc
//             }
//         }
//         dashboardData = {
//             bookingDetails: bookingArr,
//             paymentDetails: paymentArr,
//             vehicleObj
//         };
//         res.status(200).json({
//             message: "Data fetched successfully",
//             dashboardData
//         });
//     } catch (error) {
//         console.error("Error fetching booking details:", error);
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// };

module.exports.getDashboardData = async (req, res) => {
    try {
        const { id } = req.params;
        let dashboardData = [];
        let allData = {};
        const bookingDetails = await Booking.find({ userId: id });
        for (const booking of bookingDetails) {
            const bookingId = booking._id;
            let paymentDetails = [];
            let vehicleDetail = null;
            let reviewDetails = [];
            if (booking.userId && booking.vehicleId) {
                reviewDetails = await Review.find({ userId: booking.userId, vehicleId: booking.vehicleId });
            } else {
                reviewDetails = await Review.find({ userId: booking.userId });
            }
            if (bookingId) {
                paymentDetails = await Payment.find({ bookingId: bookingId });
            }
            if (booking.vehicleId) {
                vehicleDetail = await Vehicle.findById({ _id: booking.vehicleId });
            }
            allData = {
                payment: paymentDetails,
                vehicle: vehicleDetail?._doc ? vehicleDetail._doc : vehicleDetail,
                book: bookingDetails
            };
            dashboardData.push({
                bookingDetails: {
                    ...booking._doc,
                    bookingId: booking._id
                },
                paymentDetails: paymentDetails.length > 0 ? paymentDetails[0] : null,
                vehicleDetails: vehicleDetail ? vehicleDetail._doc : null,
                reviewDetails: reviewDetails.length > 0 ? reviewDetails : null, // Fix here: handle multiple reviews
            });
        }
        res.status(200).json({
            message: "Data fetched successfully",
            dashboardData,
            allData
        });
    } catch (error) {
        console.error("Error fetching booking details:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


module.exports.updateCurrentBooking = async (req, res) => {
    try {
        const {
            bookingId, userId, vehicleId, user, email, state, city, startDate, endDate, status, totalAmount, createdAt
        } = req.body;
        if (vehicleId) {
            let vehicle = await Vehicle.findOne(
                { _id: vehicleId }
            );
            if (vehicle) {
                res.status(200).json({
                    message: "Once vehicle is booked you cant change the details, Please cancel the booking and continue",
                    bookingInfo: bookVehicle
                });
            }
        }
        const bookVehicle = await Booking.findOneAndUpdate(
            { userId: userId },
            {
                user,
                email,
                state,
                city,
                startDate,
                endDate,
            },
        );
        res.status(200).json({
            message: "Booking updated successfully",
            bookingInfo: bookVehicle
        });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}