const Review = require('../models/review.model');

module.exports.CreateReview = async (req, res) => {
    try {
        const { userId,
            vehicleId,
            rateTheVehicle,
            rateOurService,
            OrsComment,
            vehicleComment } = req.body;
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
        const getAll = await Review.find({});
        res.status(200).json({
            message: "Review fetched successfully",
            getAll,
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
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

