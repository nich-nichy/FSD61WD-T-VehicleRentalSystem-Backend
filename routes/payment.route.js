const { getAccessToken, bookVehicle } = require("../controllers/payment.controller");
const router = require("express").Router();

router.post("/paypal-auth", getAccessToken)

router.post("/book-payment", bookVehicle)

module.exports = router;