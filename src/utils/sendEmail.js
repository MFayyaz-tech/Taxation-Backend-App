var nodemailer = require("nodemailer");

// const sendEmail = async (email, text) => {
//   var transporter = nodemailer.createTransport({
//     host: process.env.MAILHOST,
//     port: process.env.MAILPORT,
//     // service: "gmail",
//     secure: false, // True for 465, false for 587
//     auth: {
//       user: process.env.MAIL,
//       pass: process.env.MAILPASS,
//     },
//     tls: {
//       rejectUnauthorized: false,
//       minVersion: "TLSv1.2",
//     },
//   });

//   var mailOptions = {
//     from: process.env.MAIL,
//     to: email,
//     subject: "Tax Wakeel OTP",
//     text: text,
//   };

//   try {
//     const result = await transporter.sendMail(mailOptions);
//     console.log("Email sent: ", result);
//   } catch (error) {
//     console.log("Error sending email: ", error);
//   }
// };

const sendEmail = async (email, text) => {
  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Bypass SSL certificate verification
    },
  });

  // Email options
  const mailOptions = {
    from: {
      email: process.env.EMAIL_USER,
      name: "Tax Wakeel",
    },
    to: email, // Recipient address
    subject: "Tax Wakeel OTP",
    text: text,
    trackingSettings: {
      clickTracking: {
        enable: false,
        enable_text: false,
      },
    },
  };

  // Send email using Nodemailer
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("result", result);
    return;
  } catch (error) {
    console.log("Error occurred:", error);
    throw new Error("Failed");
  }
};

module.exports = sendEmail;
