const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  //  currently 'token' -> show result in object ->  { token } ->  normal o/p

  const { token } = req.cookies; // to getting 'cookie' in request => we should use 'cookie-parser' in "app.js"
  //   console.log(token);
  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }

  //   if token found
  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

  //   'req.user' -> just after user authorized we store user's info in this.
  req.user = await User.findById(decodedData.id); // save entire user info -> in 'req.user'
  next();
});

//  // 🚧🚧🚧 'isAuthenticated' -> tells only user is login or not  => 🚧🚧🚧 But it doesn't tells @ user is "Admin" or not.
//  🦄🦄🦄  "authorizedRoles()" -> tells only 'Admin'
exports.authorizedRoles = (...roles) => {
  return (req, res, next) => {
    //  since,  "roles.includes()" -> it's value  "admin"
    if (!roles.includes(req.user.role)) {
      // 'req.user.roles)' -> value -> "user" -> from userModel.js

      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403
        )
      ); // '403' -> server understand what we want to do, but refuse them.
    }

    next(); //  if 'roles.includes('admin')' -> "req.user.roles" -> admin
  };
};
