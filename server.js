require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// 🔍 LOG EVERY INCOMING REQUEST (DEBUG)
app.use((req, res, next) => {
  console.log("INCOMING:", req.method, req.url);
  next();
});


// 🔥 CREATE TRANSPORTER ONCE
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // MUST be false for 587 / 2525
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,   // ✅ ADDED
  socketTimeout: 10000,
});

// 🔍 VERIFY SMTP ON STARTUP
transporter.verify((err) => {
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
    console.log("SENDING EMAIL...");

    // ✅ HARD TIMEOUT WRAPPER (IMPORTANT)
    await Promise.race([
      transporter.sendMail({
        from: `"Service Call" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html: message,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email send timeout")), 15000)
      ),
    ]);

    console.log("EMAIL SENT");
    return res.json({ success: true });

  } catch (err) {
    console.error("EMAIL ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Email server running");
});

const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Email server running on port ${PORT}`);
});
