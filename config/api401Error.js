const httpStatusCodes = require('./httpStatusCodes');
const BaseError = require('./baseError');

class Api401Error extends BaseError {
  constructor(
    name,
    statusCode = httpStatusCodes.UNAUTHRIZED,
    description = 'User Not Authorized',
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

module.exports = Api401Error;
