const router = require('express').Router();
const passport = require('passport');

const CLIENT_HOME_PAGE_URL = 'http://localhost:5173';

const authController = require('../controllers/authController');

router.get('/login/success', authController.loginSuc);
router.get('/login/failed', authController.loginFailed);
router.get('/logout', authController.logout);
router.get('/google', passport.authenticate('google'));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: CLIENT_HOME_PAGE_URL,
    failureRedirect: '/auth/login/failed',
  })
);
router.get('/facebook', passport.authenticate('facebook'));
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: CLIENT_HOME_PAGE_URL,
    failureRedirect: '/auth/login/failed',
  })
);

module.exports = router;
