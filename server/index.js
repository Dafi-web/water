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

app.use(cors());
app.use(express.json());
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

app.post("/api/requests", async (req, res) => {
  const { name, phone, email = "", projectType, message } = req.body;

  if (!name || !phone || !projectType || !message) {
    return res.status(400).json({ message: "Please fill all required fields." });
  }

  const created = await Request.create({ name, phone, email, projectType, message });

  const transporter = getMailTransporter();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (transporter && adminEmail) {
    try {
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
    } catch (error) {
      console.error("Failed to send admin email notification", error);
    }
  }

  res.status(201).json({ id: created._id });
});

app.get("/api/admin/requests", adminAuth, async (_, res) => {
  const requests = await Request.find().sort({ createdAt: -1 });
  res.json(requests);
});

app.get("/api/admin/posts", adminAuth, async (_, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

app.post("/api/admin/posts", adminAuth, upload.single("mediaFile"), async (req, res) => {
  const { title, description = "", mediaType = "image", mediaUrl = "" } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required." });
  }

  const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";
  const finalMediaUrl = fileUrl || mediaUrl;

  if (!finalMediaUrl) {
    return res.status(400).json({ message: "Upload media file or provide media URL." });
  }

  const created = await Post.create({
    title,
    description,
    mediaType: mediaType === "video" ? "video" : "image",
    mediaUrl: finalMediaUrl,
  });

  res.status(201).json(created);
});

app.delete("/api/admin/posts/:id", adminAuth, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

async function start() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Add it to your .env file.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
