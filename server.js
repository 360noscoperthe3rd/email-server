require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 CREATE TRANSPORTER ONCE
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // MUST be false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

// 🔍 VERIFY SMTP ON STARTUP (IMPORTANT)
transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP VERIFY FAILED:", err);
  } else {
    console.log("SMTP READY");
  }
});

app.post("/send-email", async (req, res) => {
  console.log("HIT /send-email");
  console.log("BODY:", req.body);

  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    await transporter.sendMail({
      from: `"Service Call" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: message,
    });

    console.log("EMAIL SENT");
    res.json({ success: true });
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).json({ error: "Email failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Email server running");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});
