const { saveTempData } = require("../controllers/booking.controller");
const router = require("express").Router();

router.post("/save-temp", saveTempData)


module.exports = router;