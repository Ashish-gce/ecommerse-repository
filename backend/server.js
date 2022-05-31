const app = require("./app"); // require 'app.js' to listen the server

const dotenv = require("dotenv");

//  //  import "mongodb" database here to connect the  Server <-> Database  DB function always call after  "dotenv"  require, b'z w/o this we can't get local / global DB URL
const connectDatabase = require("./config/database"); // NOTE:- calling connectDatabase() -> then Database is connected

// console.log(youtube);  // 🐛🐛🐛 these type of error is called  "Uncaught-Error" -> undefined
// 🐛🐛🐛 we should handle 'uncought-error' at the Top -> b'z anyone type variable and leave undefined them then i.e. caught
//  //  Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to "uncaught" Exception`);
  process.exit(1);
});

// config
dotenv.config({ path: "backend/config/config.env" }); // connecting dotenv

// connect to database
connectDatabase();

// making a server of "app.listen()"
const server = app.listen(process.env.PORT, () => {
  console.log(`server is working on http://localhost:${process.env.PORT}`); // "process.env.PORT" -> 4000, b'z it's value defined 4000 (config.env file)
});

// console.log(youtube);

// 🐛🐛🐛 Deals with 'unhhandled' Promiss Rejection -> generated when error in url (localhost / cloud-url)

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to  Unhandled  Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
