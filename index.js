import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
// Note: Removed dotenv import/config here. Since you are deploying to Vercel, 
// Vercel handles environment variables, making dotenv redundant and potentially messy.

const app = express();

// --- Configuration Setup (Run on boot) ---
// Safely parse allowed origins
// We check for ALL environments (Production/Preview/Development) on Vercel
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
console.log(`[Config] Allowed Origins: ${allowedOrigins.join(', ')}`);


// --- Middleware Configuration ---

// 1. CORS Setup
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or server-to-server)
        // Also allow the origin if it is explicitly in the list
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            // Reject any other origin
            console.error(`CORS Blocked: Origin ${origin} not in ${allowedOrigins.join(', ')}`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    // Crucially, include OPTIONS for preflight requests
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
}));

// 2. JSON body parser
app.use(express.json());


// --- Email Helper Function ---

const sendEmail = async (subject, htmlContent, res) => {
    // Logging to confirm credentials are seen by the serverless function runtime
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("CRASH DEBUG: Email credentials missing at runtime!");
        return res.status(500).json({ 
            message: "Server configuration error: Email credentials missing.", 
            details: "Please verify EMAIL_USER and EMAIL_PASS are set in Vercel environment variables."
        });
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // IMPORTANT: Must be a Gmail App Password
        },
        // We can safely remove the TLS rejectUnauthorized: false as it is 
        // generally not necessary for Gmail and can pose security risks.
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
        // Log the error detail that Nodemailer provides, which is critical for debugging
        console.error("Error sending email:", err);
        // Include the actual Nodemailer error code if available
        const errorCode = err.code ? ` (Code: ${err.code})` : '';
        res.status(500).json({ 
            message: `Email sending failed.${errorCode}`, 
            details: err.message || "Unknown email sending error." 
        });
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


// --- Vercel Export Handler ---

// This defines the function entry point that Vercel uses.
// It explicitly tells Vercel how to handle incoming requests with the Express app.
const handler = (req, res) => {
    try {
        app(req, res);
    } catch (error) {
        // Catch any synchronous errors during request handling
        console.error("Express App Crash:", error);
        res.status(500).send("Internal Server Error during application execution.");
    }
};

export default handler;