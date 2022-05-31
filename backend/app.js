const express = require("express");
const app = express(); // assign express() to "app" local-variable to use them in application

const bodyParser = require("body-parser");

const cookieParser = require("cookie-parser");

const errorMiddleware = require("./middleware/error");

app.use(bodyParser.json());

//  getting data from 'body' in  JSON  format.
app.use(cookieParser());

//  use of 'cookie' in our application
app.use(cookieParser());

// Route Imports (configure each routes here):-
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");

//  => api ->  'api/v1/products'  ->  product -> products -> productRoute.js file
//  => api ->  'api/v1/product/new'  ->  product -> product/new -> productRoute.js file

app.use("/api/v1", product); // "/api/v1"  ->  this string is always added with every request
app.use("/api/v1", user);
app.use("/api/v1", order);

//  Middleware for Error
app.use(errorMiddleware); // here our application using "errorMiddleware()" -> comes from "./middleware/error.js" file

module.exports = app;
