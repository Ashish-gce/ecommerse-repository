const ErrorHandler = require("../utils/errorHandler");

let errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  //  Wrong mongodb id error -> type 'wrong' mongodb url
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //  mongoose duplicate key error  ->  type 'duplicate' emailId for registration
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  //  Wrong JWT error  ->  enter wrong 'jwt(jsonWebToken)' id
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is Invalid, Please Try again.`;
    err = new ErrorHandler(message, 400);
  }

  //  JWT Expire error  ->  when our Token (JsonWebTojen) got expire
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is Expired, Please Try again.`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    // error: err.stack, // to know the error whole path

    // message: err.message,

    error: err.stack,
  });
};

module.exports = errorHandler;
