const Vehicle = require('../models/vehicle.model');
const { APP_URL } = process.env;

module.exports.getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({});
        if (!vehicles) {
            return res.json({ message: "No vehicles in the garage" });
        }
        res
            .status(201)
            .json({ message: "Vehicles fetched successfully", vehicles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports.addVehicles = async (req, res) => {
    try {
        const { data } = req.body;
        const vehicles = await Vehicle.insertMany(data);
        res.status(201).json({ message: "Vehicles inserted successfully", vehicles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
