const { saveTempData } = require("../controllers/vehicle.controller");
const router = require("express").Router();

router.post("/save-temp", saveTempData)


module.exports = router;