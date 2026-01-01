require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Email server running");
});

// Email sending endpoint
app.post("/send-email", async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Create transporter for Brevo SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // use TLS false for port 587
      auth: {
        user: process.env.EMAIL_USER, // Brevo SMTP Login
        pass: process.env.EMAIL_PASS, // Brevo SMTP Key
      },
    });

    // Send mail
    await transporter.sendMail({
      from: `"Service Call" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: message,
    });

    console.log(`EMAIL SENT: ${to}`);
    res.json({ success: true });
  } catch (err) {
    console.error("EMAIL ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});
