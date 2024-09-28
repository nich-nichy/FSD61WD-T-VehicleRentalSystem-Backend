// const Payment = require('../models/payment.model');
const { APP_URL } = process.env;
const Payment = require('../models/payment.model');
const Vehicle = require('../models/vehicle.model');
const { generateAccessToken } = require('../utils/paypal.js');
const axios = require('axios');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateInvoice = async (bookingData, amount) => {
    const doc = new PDFDocument();
    const filePath = `./invoices/invoice_${bookingData.bookingId}.pdf`;
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Booking ID: ${bookingData.bookingId}`);
    doc.text(`User Name:${bookingData?.username ? bookingData?.username : 'Test User'} User ID: ${bookingData.userId}`);
    doc.text(`Vehicle: ${bookingData?.vehicle.make}`);
    doc.text(`Model: ${bookingData?.vehicle.model} Type: ${bookingData?.vehicle.type}`);
    doc.text(`Amount: ${amount}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text('Thank you for renting with ORS!', { align: 'center' });
    doc.end();
    return filePath;
};


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
        const { amount, bookingData } = req.body;
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
        let savePayment = "";
        // if (res.data) {
        //     savePayment = await Payment.create({
        //         userId: bookingData?.userId,
        //         bookingId: bookingData?.bookingId,
        //         status: true,
        //         amount: formattedAmount,
        //         paymentMethod: 'Paypal',
        //         paymentStatus: response.data ? true : false,
        //     });
        //     await generateInvoice(bookingData, formattedAmount);
        //     const transporter = nodemailer.createTransport({
        //         service: 'Gmail',
        //         auth: {
        //             user: process.env.EMAIL_USER,
        //             pass: process.env.EMAIL_PASS,
        //         }
        //     });
        //     await transporter.sendMail({
        //         to: bookingData?.email,
        //         from: process.env.EMAIL_USER,
        //         subject: 'ORS - Your rental partner',
        //         html: `
        //                 <p>Hello user!</p>
        //                 <p>You have rented the car. Invoice will be ready by 1 min, Please check your Dashboard.</p>
        //                 <p>Thanks and regards - Team ORS</p>
        //                 <span>Note: All the amounts and credentials are samples for development purpose.</span>
        //             `
        //     });
        // }
        const vehicleDetails = await Vehicle.findById({ _id: bookingData?.vehicleId })
        console.log(vehicleDetails)
        let invoiceObj = {
            ...bookingData,
            vehicle: {
                ...vehicleDetails._doc
            }
        };
        console.log(invoiceObj)
        if (response.data) {
            try {
                const savePayment = await Payment.create({
                    userId: bookingData?.userId,
                    bookingId: bookingData?.bookingId,
                    status: true,
                    amount: formattedAmount,
                    paymentMethod: 'Paypal',
                    paymentStatus: response.data ? true : false,
                });
                const invoice = await generateInvoice(invoiceObj, formattedAmount);
                const transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });
                await transporter.sendMail({
                    to: bookingData?.email,
                    from: process.env.EMAIL_USER,
                    subject: 'ORS - Your rental partner',
                    html: `
                <p>Hello user!</p>
                <p>You have rented the car. Please find the invoice attached.</p>
                <p>Thanks and regards - Team ORS</p>
                <span>Note: All the amounts and credentials are samples for development purposes.</span>
            `,
                    attachments: [
                        {
                            filename: `invoice_${bookingData.bookingId}.pdf`,
                            content: invoice,
                        },
                    ],
                });
                res.status(200).json({
                    message: 'Payment successful, invoice sent via email.',
                });
            } catch (emailError) {
                console.error('Error sending email:', emailError);
                res.status(200).json({
                    message: 'Payment successful, but email failed. Please check your dashboard for the invoice.',
                });
            }
        } else {
            res.status(500).json({
                message: 'Payment failed.',
            });
        }

        const approvalLink = response.data.links.find(link => link.rel === 'approve').href;
        res.status(200).json({
            message: 'PayPal order created successfully',
            approvalLink,
            savePayment
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
