const nodemailer = require("nodemailer");

const mailer = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: process.env.FROM_EMAIL, // sender address
    to: options.toEmail, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  };

  // send mail with defined transport object
  await transporter.sendMail(message);
};

module.exports = mailer;
