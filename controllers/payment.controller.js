// const Payment = require('../models/payment.model');
const { APP_URL } = process.env;
const { generateAccessToken } = require('../utils/paypal.js');
const axios = require('axios');

module.exports.getAccessToken = async (req, res) => {
    try {
        const response = await generateAccessToken();
        console.log(response);
        res
            .status(201)
            .json({ response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports.bookVehicle = async (req, res) => {
    try {
        const { amount } = req.body;
        const formattedAmount = parseFloat(amount).toFixed(2);
        const accessToken = await generateAccessToken();
        const response = await axios.post(
            `${process.env.PAYPAL_BASE}/v2/checkout/orders`,
            {
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        items: [
                            {
                                name: 'Online rental system',
                                description: 'An online vehicle rental system',
                                quantity: 1,
                                unit_amount: {
                                    currency_code: 'USD',
                                    value: formattedAmount
                                }
                            }
                        ],
                        amount: {
                            currency_code: 'USD',
                            value: formattedAmount,
                            breakdown: {
                                item_total: {
                                    currency_code: 'USD',
                                    value: formattedAmount
                                }
                            }
                        }
                    }
                ],
                application_context: {
                    return_url: `${process.env.APP_URL}/complete-order`,
                    cancel_url: `${process.env.APP_URL}/cancel-order`,
                    shipping_preference: 'NO_SHIPPING',
                    user_action: 'PAY_NOW',
                    brand_name: 'ORS.in'
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        const approvalLink = response.data.links.find(link => link.rel === 'approve').href;
        res.status(200).json({
            message: 'PayPal order created successfully',
            approvalLink
        });
    } catch (error) {
        console.error('Error creating PayPal order:', error.response ? error.response.data : error);
        res.status(500).json({
            message: 'Failed to create PayPal order',
            error: error.response ? error.response.data : error.message
        });
    }
};

module.exports.capturePayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const accessToken = await generateAccessToken()
        const response = await axios({
            url: process.env.PAYPAL_BASE + `/v2/checkout/orders/${orderId}/capture`,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        })
        res
            .status(200)
            .json(response);
    } catch (error) {
        console.error('Error creating PayPal order:', error.response ? error.response.data : error);
        res.status(500).json({
            message: 'Failed to create PayPal order',
            error: error.response ? error.response.data : error.message
        });
    }

}

module.exports.cancelVehicle = async (req, res) => {
    try {
        const { orderId } = req.body;

        res
            .status(200)
            .json({ response });
    } catch (error) {
        console.error('Error creating PayPal order:', error.response ? error.response.data : error);
        res.status(500).json({
            message: 'Failed to create PayPal order',
            error: error.response ? error.response.data : error.message
        });
    }

}
