import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

const app = express();
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
}));
app.use(express.json());
 
app.post("/landing", async (req, res) => {
  const { name, email, product } = req.body;
 
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
    rejectUnauthorized: false,
  },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `New Inquiry from ${name}`,
    html: `
      <h2>Client Inquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Product name:</strong> ${product}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully." });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ message: "Email sending failed." });
  }
});

app.post("/contact", async (req, res) => {
  const { name, email, product, requirements  } = req.body;
 
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
    rejectUnauthorized: false,
  },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `New Inquiry from ${name}`,
    html: `
      <h2>Client Inquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Product name:</strong> ${product}</p>
      <p><strong>Requirements:</strong> ${requirements}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully." });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ message: "Email sending failed." });
  }
});

app.post("/product", async (req, res) => {
  const { name, email, product, quantity } = req.body;
 
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
    rejectUnauthorized: false,
  },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `New Inquiry from ${name}`,
    html: `
      <h2>Client Inquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Product:</strong> ${product}</p>
      <p><strong>Quantity:</strong> ${quantity}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully." });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ message: "Email sending failed." });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
