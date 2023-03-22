const Api401Error = require('../config/api401Error');

module.exports = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next(new Api401Error(`User not authenticated`));
  } else {
    next();
  }
};
