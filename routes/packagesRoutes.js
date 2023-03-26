const router = require('express').Router();
const packagesController = require('../controllers/packagesController');

router.get('/', packagesController.getAll);
router.post(
  '/create-checkout-session',
  packagesController.createPaymentSession
);
router.get('/success', packagesController.paymentSuccess);

module.exports = router;
