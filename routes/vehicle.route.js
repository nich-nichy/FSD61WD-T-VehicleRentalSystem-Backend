const { getVehicles, addVehicles } = require("../controllers/vehicle.controller");
const router = require("express").Router();

router.get("/get-all", getVehicles)

router.post("/save-vehicles", addVehicles)

module.exports = router;