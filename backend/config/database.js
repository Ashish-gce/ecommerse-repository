//  code of mongoose database creation

const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(
      process.env.DB_URL
      // "process.env.DB_URL" -> link of  'mongodb-cloud-database' or  'local-database' url -> present in  'config/database.js'
    )
    .then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    });

  //  below catch block is handled by  ->  Deals with 'unh-handled promiss-rejection' in server.js file

  // 🐛🐛🐛  below code comment reason b'z if something wrong with 'url' -> either local/global then -> .then() "reject" and below block .catch() resolve
  //   So, to "unhandledRejection" we need to comment below lines of code  ->  Taki ynha se server page p jake 'unhandledRejection' perform krwa ske.
  //  ⚕️⚕️⚕️
  // .catch((err) => {
  //   console.log(err);
  // });
};

module.exports = connectDatabase;
