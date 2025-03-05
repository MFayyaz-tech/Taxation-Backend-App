const nodemailer = require("nodemailer");

const sendEmail = async (formData) => {
  //   const formData = {
  //     rname: "John Doe",
  //     remail: "john.doe@example.com",
  //     rphone: "123-456-7890",
  //     cname: "Jane Smith",
  //     cemail: "jane.smith@example.com",
  //     cphone: "987-654-3210",
  //     cuname: "Company ABC",
  //     cuemail: "companyabc@example.com",
  //     cuphone: "555-123-4567",
  //     cumobile: "555-987-6543",
  //     hearus: "Social Media",
  //     intro: "Interested in your services.",
  //     contact_time: "9:00 AM - 5:00 PM",
  //     country: "USA",
  //   };

  const {
    rname,
    remail,
    rphone,
    cname,
    cemail,
    cphone,
    cuname,
    cuemail,
    cuphone,
    cumobile,
    hearus,
    intro,
    contact_time,
    country,
  } = formData;

  const cleanInput = (input) =>
    input ? input.replace(/[^a-zA-Z0-9@.\s]/g, "") : "";

  // Assign cleaned inputs
  const name = cleanInput(rname || cname || cuname);
  const visitorEmail = cleanInput(remail || cemail || cuemail);
  const phone = cleanInput(rphone || cphone || cuphone);
  const mobile = cleanInput(cumobile);
  const hearAboutUs = cleanInput(hearus);
  const contactTime = cleanInput(contact_time || "Day Time");
  const countryInfo = cleanInput(country || "Unknown");

  // Dynamically construct the message
  let message =
    "<div>The Contact form information is as follows:</div><div><br /></div>";

  if (name) {
    message += `<div>Name: ${name}</div><div><br /></div>`;
  }

  if (visitorEmail) {
    message += `<div>Email: ${visitorEmail}</div><div><br /></div>`;
  }

  if (phone) {
    message += `<div>Phone: ${phone}</div><div><br /></div>`;
  }

  if (mobile) {
    message += `<div>Mobile: ${mobile}</div><div><br /></div>`;
  }

  if (countryInfo) {
    message += `<div>Country: ${countryInfo}</div><div><br /></div>`;
  }

  if (hearAboutUs) {
    message += `<div>How did you hear about us: ${hearAboutUs}</div><div><br /></div>`;
  }

  if (contactTime) {
    message += `<div>Preferred Time to Contact: ${contactTime}</div><div><br /></div>`;
  }
  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
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
      name: "Quran Reading",
    },
    to: process.env.TO_EMAIL, // Recipient address
    subject: "Quran Reading - Online User Registration",
    html: message,
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

module.exports = { sendEmail };
