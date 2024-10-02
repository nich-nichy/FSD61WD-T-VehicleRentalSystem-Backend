const Payment = require('../models/payment.model');
const Vehicle = require('../models/vehicle.model');
const User = require('../models/users.model');
const Invoice = require('../models/invoice.model.js');
const { generateAccessToken } = require('../utils/paypal.js');
const axios = require('axios');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const generateInvoice = async (bookingData, amount) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const chunks = [];
        doc.on('data', (chunk) => {
            chunks.push(chunk);
        });
        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(chunks);
            const newInvoice = new Invoice({
                bookingId: bookingData.bookingId,
                invoiceData: pdfBuffer,
            });

            try {
                const savedInvoice = await newInvoice.save();
                resolve(savedInvoice);
            } catch (error) {
                reject(error);
            }
        });
        doc.fontSize(20).text('Invoice', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Booking ID: ${bookingData.bookingId}`);
        doc.text(`User Name: ${bookingData?.user?.username || 'ORS User'}`);
        doc.text(`Vehicle: ${bookingData?.vehicle?.make}`);
        doc.text(`Model: ${bookingData?.vehicle?.model}, Type: ${bookingData?.vehicle?.type}`);
        doc.text(`Amount: ${amount}`);
        doc.text(`Payment type: Paypal`);
        doc.text(`Booked on: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc.text('Thank you for renting with ORS!', { align: 'center' });
        doc.end();
    });
};

module.exports.getAccessToken = async (req, res) => {
    try {
        const response = await generateAccessToken();
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
            message: 'PayPal order created successfully, Please check your email',
            approvalLink,
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
        const { orderId, bookingData } = req.body;
        const accessToken = await generateAccessToken();
        const vehicleDetails = await Vehicle.findById(bookingData.vehicleId);
        const userDetails = await User.findById(bookingData.userId);
        const invoiceObj = {
            ...bookingData,
            vehicle: vehicleDetails.toObject(),
            user: userDetails.toObject(),
        };
        const response = await axios.post(
            `${process.env.PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );
        const paymentStatus = await Payment.findOne({ bookingId: bookingData.bookingId });
        if (!paymentStatus) {
            try {
                if (response.data) {
                    const savePayment = await Payment.create({
                        userId: bookingData?.userId,
                        bookingId: bookingData?.bookingId,
                        status: true,
                        amount: bookingData?.totalAmount,
                        paymentMethod: 'Paypal',
                        paymentStatus: response.data ? true : false,
                    });
                    const savedInvoice = await generateInvoice(invoiceObj, bookingData.totalAmount);
                    const transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS,
                        },
                    });
                    await transporter.sendMail({
                        to: bookingData.email,
                        from: process.env.EMAIL_USER,
                        subject: 'ORS - Your rental partner',
                        html: `
                    <p>Hello ${invoiceObj.user.username}!</p>
                    <p>You have rented the car. Please find the invoice attached.</p>
                    <p>Thanks and regards - Team ORS</p>
                    <span>Note: All the amounts and credentials are samples for development purposes.</span>
                `,
                        attachments: [
                            {
                                filename: `invoice_${bookingData.bookingId}.pdf`,
                                content: savedInvoice.invoiceData,
                            },
                        ],
                    });
                    res.status(200).json({
                        message: 'Payment captured successfully', savePayment,
                    });
                } else {
                    res.status(404).json({
                        message: 'There is a issue',
                        error: error.response ? error.response.data : error.message
                    });
                }
            } catch (error) {
                res.status(404).json({
                    message: 'Failed to create PayPal order',
                    error: error.response ? error.response.data : error.message
                });
            }
        }
    } catch (error) {
        console.error('Error capturing payment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports.getInvoice = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const invoice = await Invoice.findOne({ bookingId });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${bookingId}.pdf`);
        res.send(invoice.invoiceData);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving invoice', error });
    }
};
