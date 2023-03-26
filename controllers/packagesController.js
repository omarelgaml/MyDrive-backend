/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');

// I know companies is written wrong, but for the convesnion
const Package = mongoose.model('packages');
const User = mongoose.model('users');

const stripe = require('stripe')('sk_test_9q4pID5g4yVSbwnMRhlbJlRc00dcZ5R9db');

exports.getAll = async (req, res, next) => {
  try {
    const packages = await Package.find({});
    res.status(200).send({ packages });
  } catch (err) {
    next(err);
  }
};
exports.createPaymentSession = async (req, res, next) => {
  try {
    const { package } = req.body;
    const ses = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${package.name} : ${package.storage} MB`,
            },
            unit_amount: package.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // In case of success return to the server to update the user
      success_url: `http://localhost:3000/api/packages/success?session_id={CHECKOUT_SESSION_ID}`,
      // In case of failure return to the client
      cancel_url: 'http://localhost:5173/payment-failure',
      metadata: {
        storage: package.storage,
      },
    });
    res.status(200).send({ id: ses.id });
  } catch (err) {
    next(err);
  }
};
exports.paymentSuccess = async (req, res, next) => {
  try {
    const sessionId = req.query.session_id;

    const sessionData = await stripe.checkout.sessions.retrieve(sessionId);

    if (sessionData.payment_status === 'paid') {
      const user = await User.findOne({ id: req.user._id });

      user.totalStorage += Number(sessionData.metadata.storage);

      await user.save();

      res.redirect('http://localhost:5173/payment-success');
    } else {
      res.redirect('http://localhost:5173/payment-failure');
    }
  } catch (err) {
    next(err);
  }
};
