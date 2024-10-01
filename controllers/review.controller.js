const Review = require('../models/review.model');
const User = require('../models/users.model');
const Vehicle = require('../models/vehicle.model');

module.exports.CreateReview = async (req, res) => {
    try {
        const { userId,
            vehicleId,
            rateTheVehicle,
            rateOurService,
            OrsComment,
            vehicleComment } = req.body;
        const checkPreviousReview = await Review.findOne({ userId: userId, vehicleId: vehicleId });
        if (checkPreviousReview) {
            return res.status(400).json({
                message: "You have already submitted a review for this vehicle",
            });
        }
        const getAll = await Review.create({
            userId,
            vehicleId,
            rateTheVehicle,
            rateOurService,
            OrsComment,
            vehicleComment
        });
        res.status(200).json({
            message: "Review created successfully",
            getAll,
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports.GetAllReviews = async (req, res) => {
    try {
        const users = await User.find({});
        const reviews = await Review.find({});
        const vehicleIds = reviews.map(review => review.vehicleId);
        const vehicles = await Vehicle.find({ _id: { $in: vehicleIds } });
        const allData = reviews.map((review) => {
            const user = users.find(u => u._id.toString() === review.userId.toString());
            const vehicle = vehicles.find(v => v._id.toString() === review.vehicleId.toString());

            return {
                username: user ? user.username : "Unknown",
                profilePicture: user ? user.profilePicture : "",
                reviewDetails: review,
                vehicleDetails: vehicle ? vehicle : "Vehicle not found"
            };
        });
        res.status(200).json({
            message: "Reviews fetched successfully",
            data: allData
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


module.exports.getVehicleReview = async (req, res) => {
    try {
        const { vehicleId } = req.body;
        const getAll = await Review.findById({ vehicleId });

        res.status(200).json({
            message: "Fetched vehicle's review successsfully",
            getAll,
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

