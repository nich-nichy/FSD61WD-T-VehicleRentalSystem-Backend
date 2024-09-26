const axios = require('axios');
const qs = require('qs');

module.exports.generateAccessToken = async (req, res) => {
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    try {
        const response = await axios({
            url: `https://api-m.sandbox.paypal.com/v1/oauth2/token`,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
            },
            data: qs.stringify({
                grant_type: 'client_credentials',
            }),
        });
        return response.data.access_token;
    } catch (error) {
        console.error("Error generating PayPal access token:", error);
        throw error;
    }
}
