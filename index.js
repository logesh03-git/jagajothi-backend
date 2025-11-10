import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables locally (ignored by Vercel)
dotenv.config();

// Safely parse allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

const app = express();

// --- Middleware Configuration ---

// 1. CORS Setup
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Reject any other origin
      callback(new Error("Not allowed by CORS"));
    }
  },
  // Crucially, include OPTIONS for preflight requests
  methods: ["GET", "POST", "OPTIONS"],
}));

// 2. Preflight handling for all routes
app.options('*', cors());

// 3. JSON body parser
app.use(express.json());

// --- Email Helper Function ---

const sendEmail = async (subject, htmlContent, res) => {
  // Ensure we have credentials before creating transporter
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email credentials missing in environment variables.");
    return res.status(500).json({ message: "Server configuration error: Email credentials missing." });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // IMPORTANT: Must be a Gmail App Password
    },
    // Allows connections without valid SSL certificates (for development, often needed on Vercel/Node environment)
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Sending to yourself
    subject: subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully." });
  } catch (err) {
    console.error("Error sending email:", err);
    // Log the error detail that Nodemailer provides
    res.status(500).json({ message: `Email sending failed. Error: ${err.message || "Unknown error"}` });
  }
};

// --- API Routes ---

// Health check endpoint
app.get("/", (req, res) => {
    res.status(200).send("API is running.");
});

app.post("/landing", async (req, res) => {
  const { name, email, product } = req.body;
  const subject = `New Inquiry (Landing) from ${name}`;
  const html = `
    <h2>Client Inquiry (Landing Page)</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Product name:</strong> ${product}</p>
  `;
  await sendEmail(subject, html, res);
});

app.post("/contact", async (req, res) => {
  const { name, email, product, requirements } = req.body;
  const subject = `New Inquiry (Contact) from ${name}`;
  const html = `
    <h2>Client Inquiry (Contact Form)</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Product name:</strong> ${product}</p>
    <p><strong>Requirements:</strong> ${requirements}</p>
  `;
  await sendEmail(subject, html, res);
});

app.post("/product", async (req, res) => {
  const { name, email, product, quantity } = req.body;
  const subject = `New Inquiry (Product) from ${name}`;
  const html = `
    <h2>Client Inquiry (Product Page)</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Product:</strong> ${product}</p>
    <p><strong>Quantity:</strong> ${quantity}</p>
  `;
  await sendEmail(subject, html, res);
});

export default app;