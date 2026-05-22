import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import nodemailer from "nodemailer";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Post from "./models/Post.js";
import Request from "./models/Request.js";
import { adminAuth } from "./middleware/adminAuth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const app = express();
const port = process.env.PORT || 5000;

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://water-chi-two.vercel.app",
  "https://water-frontend-kappa.vercel.app",
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : defaultAllowedOrigins;

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Allow Vercel production and preview deployments (*.vercel.app)
  if (/^https:\/\/[\w.-]+\.vercel\.app$/i.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) return callback(null, origin || true);
      return callback(null, false);
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-admin-key"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static(path.join(projectRoot, "uploads")));

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(projectRoot, "uploads")),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(ext, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);
    cb(null, `${Date.now()}-${safeName}${ext}`);
  },
});

const upload = multer({ storage });

function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

app.get("/api/health", (_, res) => {
  res.json({ ok: true });
});

app.get("/api/posts", async (_, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

async function notifyAdminByEmail({ name, phone, email, projectType, message }) {
  const transporter = getMailTransporter();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!transporter || !adminEmail) return;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: adminEmail,
    subject: `New Project Request - ${projectType} - ${name}`,
    text: [
      "You received a new request from your website.",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email || "Not provided"}`,
      `Project Type: ${projectType}`,
      "",
      "Message:",
      message,
    ].join("\n"),
  });
}

app.post("/api/requests", async (req, res) => {
  try {
    const { name, phone, email = "", projectType, message } = req.body;

    if (!name || !phone || !projectType || !message) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    const created = await Request.create({ name, phone, email, projectType, message });

    // Respond immediately so the browser is not blocked by slow/failing SMTP.
    res.status(201).json({ id: created._id, ok: true });

    void notifyAdminByEmail({ name, phone, email, projectType, message }).catch((error) => {
      console.error("Failed to send admin email notification", error);
    });
  } catch (error) {
    console.error("Failed to save request", error);
    res.status(500).json({ message: "Failed to save request." });
  }
});

app.get("/api/admin/requests", adminAuth, async (_, res) => {
  const requests = await Request.find().sort({ createdAt: -1 });
  res.json(requests);
});

app.get("/api/admin/posts", adminAuth, async (_, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

async function adminCreatePostHandler(req, res) {
  const { title, description = "", mediaType = "image", mediaUrl = "", mediaDataUrl = "" } = req.body || {};

  if (!title) {
    return res.status(400).json({ message: "Title is required." });
  }

  const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";
  const finalMediaUrl = fileUrl || mediaDataUrl || mediaUrl;

  if (!finalMediaUrl) {
    return res.status(400).json({ message: "Upload media file or provide media URL / data." });
  }

  try {
    const created = await Post.create({
      title,
      description,
      mediaType: mediaType === "video" ? "video" : "image",
      mediaUrl: finalMediaUrl,
    });
    res.status(201).json(created);
  } catch {
    res.status(500).json({ message: "Failed to create post." });
  }
}

app.post(
  "/api/admin/posts",
  adminAuth,
  (req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("multipart/form-data")) {
      return upload.single("mediaFile")(req, res, next);
    }
    next();
  },
  adminCreatePostHandler
);

app.delete("/api/admin/posts/:id", adminAuth, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

async function start() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Add it to backend/.env or Render environment.");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    if (error?.code === 8000 || error?.codeName === "AtlasError") {
      console.error(
        "MongoDB authentication failed. Check MONGO_URI username/password on Render. Encode @ in password as %40."
      );
    }
    throw error;
  }

  app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error.message || error);
  process.exit(1);
});
