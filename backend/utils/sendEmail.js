//  "nodemailer" -> send the mail to the user

const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    //  🐛🐛🐛 Note:- "nodeMailer" has a problem with 'google-gmail' -> but not with other
    //  So, we should explictly provide the  Google-gmail -> host && port name to work correctly.  🐛🐛 But, But if we uses other services then we need to write that's 'host' & 'port' name
    //  😕😕😕😕😕  "process.env.SMTP_HOST/PORT/SERVICE/MAIL/..."  =>  to use these features / services "dynamically"  only by changing it through one place not from different places ->  'config.env' file

    host: process.env.SMTP_HOST, //"smtp.gmail.com" ->  // host of gmail
    port: process.env.SMTP_PORT, //587 ->  // port of gmail
    service: process.env.SMTP_SERVICE,
    auth: {
      // for authentication purpose
      //  'user', 'password' -> stores in  ".env" file,  b'z  in future our login mail/password distory by any reasom then we don't need to "recode" -> only we need to change in  ".env" file and  ALL-RIGHT.
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL, // jo hmne email login ki h
    // jisko mail bjejni  'options' -> contains 'email', 'subject', 'message'
    to: options.email, //  coming from user-side
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
