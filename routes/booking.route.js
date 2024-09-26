const { saveTempData, totalPrice } = require("../controllers/booking.controller");
const router = require("express").Router();

router.post("/save-temp", saveTempData)

router.get("/get-price/:id", totalPrice)

module.exports = router;