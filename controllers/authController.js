const CLIENT_HOME_PAGE_URL = 'http://localhost:5173/login';
const Api401Error = require('../config/api401Error');

exports.logout = async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    res.redirect(CLIENT_HOME_PAGE_URL);
  });
};
exports.loginSuc = (req, res) => {
  if (req.user) {
    res.send({
      success: true,
      message: 'user has successfully authenticated',
      user: req.user,
      cookies: req.cookies,
    });
  }
};
exports.loginFailed = (_, res, next) => {
  next(new Api401Error(`User not authenticated`));
};
