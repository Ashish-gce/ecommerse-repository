//  // ♻️ making function of below commented code

// const token = user.getJWTToken();
//   res.status(201).json({
//     success: true,
//     token, // returning token (for particular user)
//   });

// 💯 Creating 'Token' and saving them into 'cookie'

const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken(); // call this function and return value store in "token"

  //  options for cookie -> takes some options
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // converts days in "milliseconds"
    ),
    httpOnly: true,
  };
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;
