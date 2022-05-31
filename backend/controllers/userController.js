// 1st (before this page) making 'userModel'

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/userModel"); // importing userModel
const sendToken = require("../utils/jwtToken");

const sendEmail = require("../utils/sendEmail");

const crypto = require("crypto");
const { findById, findByIdAndUpdate } = require("../models/userModel");

//  🥇🥇 Register a user
exports.register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body; // fetching from body

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "This is a simple_id",
      url: "profilepicurl",
    },
  });

  //   const token = user.getJWTToken();
  //   res.status(201).json({
  //     success: true,
  //     token, // returning token (for particular user)
  //   });

  sendToken(user, 201, res); // this is the removal of of above 5-lines of code
});

//  Login User
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  //  //  checking if user has given password and email both
  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email and Password", 400));
  }

  //  agrg user 'email' & 'password' mil gaya
  const user = await User.findOne({ email }).select("+password"); // we write seperately '.select("+password")' -> b'z we're done password{ select: false } -> in userModel.js b'z we don't want to display "password" along with user's details
  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401)); // '401' -> unauthorized error
  }

  const isPasswordMatched = await user.comparePassword(password); // 'password' -> comes from req.body
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  sendToken(user, 200, res); // this is the removal of of above 5-lines of code
});

//  //  🥇🥇 Logout User
exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

//  🥇🥇 Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  //  when user click on 'forgotPassword' -> then we search that (particular) user through "Email" -> b'z email is 'UNIQUE'
  const user = await User.findOne({ email: req.body.email }); // during forgetPassword we need / compulsary need to enter email -> So, we know the 'user'

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  //  get ResetPassword Token   // 'getResetPasswordToken()' function return  "resetToken" so we need to save them
  const resetToken = user.getResetPasswordToken(); // generating token

  //  below we get 'password' and save them also
  await user.save({ validateBeforeSave: false }); // here 'saving' getResetPasswordToken() return items -> resetToken(save) -> contsins -> 1. resetPasswordToken  2. resetPasswordExpire

  // 📴 📔  Now, generating  "link" -> that we send through mail to user -> click link and do 'forgetPassword'
  //  // So, we should remoce 'hash' from them and send proper link -> user click and perform operation on them

  //  localhost -> ${req.get('host')} -> to get 'host-name' dynamically
  //  http -> ${req.protocol} -> to get http / https dynamically
  //  http://localhost/api/v1/password/reset/${resetToken}  =>  local url -> work only up on local m/c
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`; // => my generated url

  //  🥇 generating a message -> that we send by 'email' to customer
  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n if you have not requested this email then, please ignore it.`;

  //  🥇 sending message to user

  try {
    await sendEmail({
      //  sendEmail() -> a method that takes an object as parameter
      // sending email 'parameter'
      email: user.email, // email send to which
      subject: `Ecommerce Password Recovery`,
      message, // coming from above
    });

    //  as soon as 'email' send below message display not execute before above message (b'z) of  "await"
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    //  when we get error in catch -> then 1st  we need to "undefined" -> resetPasswordToken && resetPasswordExpire  and  after undefined also "save" them.
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false }); // save after 'undefined' 'resetPasswordToken' 'resetPasswordExpire'

    return next(new ErrorHandler(error.message, 500));
  }
});

//  🥇🥇 💻 Reset Password -> forgotPassword send an url to the user -> resetPassword receive 'request' from the user to reset the password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  // now we're accessing 'Token' from url -> req.params.token (fetching) that we send to user through mail
  //  and after accessing-Token (url) -> we searching our user in DataBase through received 'Token'
  //  🥇🥇  we already 'save' token in DB in "hash" format -> "userModel.js" file

  // creating tiken hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token) // .update(resetToken) -> resetToken -> req.params.token -> token getting from url
    .digest("hex");

  //  now searching receive(url -> token) in our database -> b'z we save token in DB hash format in "userModule.js" file and user found then do this
  const user = await User.findOne({
    resetPasswordToken, // 'resetPasswordToken' -> user's search from DB
    resetPasswordExpire: { $gt: Date.now() }, //  " $gt: Date.now()" -> 'tokenExpire' time -> greater than now (login) time
  });

  // if user not found then di this
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is Invalid or has been Expired",
        400
      )
    );
  }

  // if user found and 'resetPasswordToken' -> correct  then 'Change the Password'
  //  🐛🐛🐛 But 'new password' && 'confirm password' is different
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password doesn't match.", 400));
  }

  //  if both (password && confirmPassword) are same then "change the password"
  user.password = req.body.password;

  // after password changes successfully -> again 'undefines' resetPasswordToken && resetPasswordExpire
  //  these're undefine b'z, password is changes -> now there is no sence of these untill user do again 'forgotPassword'
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save(); // save all changes that we do above

  // after password changes, again user's do login
  sendToken(user, 200, res); // do login
});

//  🥇🥇 Get User's(individual - apni details) Details  ->  Only those can access these 'route' who is loggedIn not another
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  //  👿 and we know that as user got "logIn" -> user's details get saved in  📥📥📥  "req.user" (auth.js file) -> we can access user's details through it

  const user = await User.findById(req.user.id); // 'req.user' -> it save all user details  ->  "auth.js"

  res.status(200).json({
    success: true,
    user,
  });
});

//  NOTE:- 👍 👍 'req.params.id' -> find id from URL  &&  'req.user.id' -> find id from "req.user" -> that we saved user's details at login Time.  &&  "req.body./..." -> coming from frontEnd

//  🥇🥇 Update User Password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password"); // b'z 'password' is hidden. So we need to include them explictly -> To perform operation on them (pasword)

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword); // 'oldPassword' -> comes from DB
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is Incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not matched", 400));
  }

  user.password = req.body.newPassword;

  await user.save(); // 💯💯💯 very imp. after do any changes in DB (specially -> user, id, password)

  sendToken(user, 200, res);
});

//  🥇🥇 Update User Profile
exports.updateUser = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    // password: "",  ->  To update 'password' we've a seperate route
  };

  //  we will add cloudinary letter

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//  🥇🥇 Get all user's Details  ->  --Admin can see any details
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find(); // "find()" -> w/o parameter search all users from DB

  res.status(200).json({
    success: true,
    users,
  });
});

//  🥇🥇 Get single user deatails  --Admin
exports.getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id); // "findById(req.params.id)" -> 'req.params.id' search from url

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//  🥇🥇 Admin - Update user's Role  Ex.-  --Admin update any user's role - "role: user" default  "role: admin"  --admin can do
exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  //  //  //  //  '(req.user.id)' -> admin itself will updated  --WRONG  do -> '(req.params.id)'
  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

//  🥇🥇 Delete User  --Admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  //  we will remove cloudinary letter

  if (!user) {
    return next(
      new ErrorHandler(`User does not exists with Id: ${req.params.id}`)
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully.",
  });
});
