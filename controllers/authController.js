const CLIENT_HOME_PAGE_URL = 'http://localhost:5173/login';

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
exports.loginFailed = (req, res) => {
  res.status(401).send({
    success: false,
    message: 'user failed to authenticate.',
  });
};
