import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

// NOTE: dotenv.config() is generally not needed on Vercel
// as environment variables are handled directly by Vercel settings.
// I've kept it here for local testing compatibility, but Vercel ignores it.
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
  methods: ["GET", "POST", "OPTIONS"],
}));

app.options('*', cors());

app.use(express.json());

// --- Define your API routes (unchanged) ---

const sendEmail = async (subject, htmlContent, req, res) => {
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
    subject: subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully." });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ message: "Email sending failed." });
  }
};

app.post("/landing", async (req, res) => {
  const { name, email, product } = req.body;
  const subject = `New Inquiry from ${name}`;
  const html = `
    <h2>Client Inquiry</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Product name:</strong> ${product}</p>
  `;
  await sendEmail(subject, html, req, res);
});

app.post("/contact", async (req, res) => {
  const { name, email, product, requirements } = req.body;
  const subject = `New Inquiry from ${name}`;
  const html = `
    <h2>Client Inquiry</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Product name:</strong> ${product}</p>
    <p><strong>Requirements:</strong> ${requirements}</p>
  `;
  await sendEmail(subject, html, req, res);
});

app.post("/product", async (req, res) => {
  const { name, email, product, quantity } = req.body;
  const subject = `New Inquiry from ${name}`;
  const html = `
    <h2>Client Inquiry</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Product:</strong> ${product}</p>
    <p><strong>Quantity:</strong> ${quantity}</p>
  `;
  await sendEmail(subject, html, req, res);
});

// -----------------------------------------------------

// Health check endpoint for Vercel/monitoring (optional but good practice)
app.get("/", (req, res) => {
    res.status(200).send("API is running.");
});

export default app;