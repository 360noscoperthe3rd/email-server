require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/send-email", async (req, res) => {
  console.log("HIT /send-email");
  console.log("BODY:", req.body);

  try {
    const { to, subject, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: "yahoo",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Service Call" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: message,
    });

    console.log("EMAIL SENT:", info.response);
    res.json({ success: true });

  } catch (err) {
    console.error("EMAIL ERROR:", err);   // 🔥 THIS IS KEY
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
  /*try {
    const { to, subject, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: "yahoo",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Service Call" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: message,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }*/
});

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Email server running");
});


app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});

