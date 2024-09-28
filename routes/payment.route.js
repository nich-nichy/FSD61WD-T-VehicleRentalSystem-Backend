const { getAccessToken, bookVehicle, capturePayment, cancelVehicle } = require("../controllers/payment.controller");
const router = require("express").Router();

router.post("/paypal-auth", getAccessToken)

router.post("/booking-payment", bookVehicle)

router.post("/capture-payment", capturePayment)

router.post("/cancel-payment", cancelVehicle)

module.exports = router;