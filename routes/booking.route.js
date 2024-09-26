const { saveTempData, totalPrice, getPreBookDetails } = require("../controllers/booking.controller");
const router = require("express").Router();

router.post("/save-temp", saveTempData)

router.get("/get-price/:id", totalPrice)

router.get("/get-prebook", getPreBookDetails)

module.exports = router;