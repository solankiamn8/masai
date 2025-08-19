const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Route to send email
app.get("/sendemail", async (req, res) => {
  try {
    // Transporter setup
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // Mail options
    let mailOptions = {
      from: process.env.EMAIL,
      to: [`${process.env.EMAIL}`, "venugopal.burli@masaischool.com"],
      subject: "Test Mail",
      text: "This is a testing Mail sent by NEM student, no need to reply.",
    };

    // Send mail
    await transporter.sendMail(mailOptions);

    res.send("✅ Email sent successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Failed to send email.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
