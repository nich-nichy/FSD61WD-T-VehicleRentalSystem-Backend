const { getAccessToken, bookVehicle, capturePayment, getInvoice } = require("../controllers/payment.controller");
const router = require("express").Router();

router.post("/paypal-auth", getAccessToken)

router.post("/booking-payment", bookVehicle)

router.post("/capture-payment", capturePayment)

router.post("/get-invoice", getInvoice)

module.exports = router;