require('dotenv').config({ path: 'config.env' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.processPayment = async (req, res, next) => {
  let myPayment;
  try {
    myPayment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'inr',
      //metadata is optional
      metadata: {
        company: 'MarketCart',
      },
    });
  } catch (err) {
    return console.log('error>>>', err);
  }
  res
    .status(200)
    .json({ success: true, client_secret: myPayment.client_secret });
};

//sending api key to frontend
exports.sendStripeApiKey = async (req, res, next) => {
  try {
    res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
  } catch (err) {
    return console.log('error>>>', err);
  }
};
