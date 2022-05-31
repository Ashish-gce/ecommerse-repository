// ♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️♻️
// ♻️♻️♻️♻️♻️  Note:- Class first letter should always be "Capital" letter  ♻️♻️♻️♻️♻️♻️

// "ErrorHandler" -> userDefined class,  "Error" -> predefinedclass in Node.js
//  // 'extends' -> 'ErrorHandler' inherits attributes and behavioue of 'Error' class, which predefined in NodeJS

class ErrorHandler extends Error {
  // constructor, takes 2-arguments (message, statusCode) i.e.  received from  'controllers' -> productController.js / ...
  // 👿 'productController' -> function's -> getProductDetail(...)/updateProduct(...)/deleteProduct(...)/... -> returns 'message' && 'statusCode' from  error portion (!product) -> not found that error is 👍👍  AUTOMATICALLY (b'z of constructor) fetched by errorHandler every time
  constructor(message, statusCode) {
    super(message); // super() -> constructor of "Error" class
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor); //  "captureStackTrace" -> a method of Error class
  }
}

module.exports = ErrorHandler; // send to middfleware -> error.js
