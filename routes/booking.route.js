const { saveTempData, totalPrice, getPreBookDetails, cancelBooking, getBookingDetails } = require("../controllers/booking.controller");
const router = require("express").Router();

router.post("/save-temp", saveTempData)

router.get("/get-price/:id", totalPrice)

router.get("/get-prebook/:id", getPreBookDetails)

router.get("/get-booking/:id", getBookingDetails)

router.delete("/cancel-booking/:id", cancelBooking)

module.exports = router;