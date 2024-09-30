const { saveTempData, totalPrice, getPreBookDetails, cancelBooking, getBookingDetails, updateBooking, getDashboardData, updateCurrentBooking } = require("../controllers/booking.controller");
const router = require("express").Router();

router.post("/save-temp", saveTempData)

router.get("/get-price/:id", totalPrice)

router.get("/get-prebook/:id", getPreBookDetails)

router.get("/get-booking/:id", getBookingDetails)

router.put("/post-book", updateBooking)

router.put('/update-booking', updateCurrentBooking)

router.delete("/cancel-booking/:id", cancelBooking)

router.get("/dashboard-data/:id", getDashboardData)

module.exports = router;