import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import serverless from "serverless-http";

import Post from "../server/models/Post.js";
import Request from "../server/models/Request.js";

const app = express();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-admin-key"],
  })
);
app.use(express.json({ limit: "20mb" }));

let isConnected = false;
async function connectDb() {
  if (isConnected) return;
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing");
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

function requireAdmin(req, res, next) {
  const adminKey = req.header("x-admin-key");
  const configuredAdminKey = process.env.ADMIN_KEY || "tsegay@shire";
  if (!adminKey || adminKey !== configuredAdminKey) {
    return res.status(401).json({ message: "Unauthorized admin key." });
  }
  next();
}

app.use(async (_, __, next) => {
  try {
    await connectDb();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (_, res) => res.json({ ok: true }));

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

app.get("/api/admin/requests", requireAdmin, async (_, res) => {
  const requests = await Request.find().sort({ createdAt: -1 });
  res.json(requests);
});

app.get("/api/admin/posts", requireAdmin, async (_, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

app.post("/api/admin/posts", requireAdmin, async (req, res) => {
  const { title, description = "", mediaType = "image", mediaUrl = "", mediaDataUrl = "" } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required." });

  const finalMediaUrl = mediaDataUrl || mediaUrl;
  if (!finalMediaUrl) {
    return res.status(400).json({ message: "Upload a media file or provide media URL." });
  }

  const created = await Post.create({
    title,
    description,
    mediaType: mediaType === "video" ? "video" : "image",
    mediaUrl: finalMediaUrl,
  });

  res.status(201).json(created);
});

app.delete("/api/admin/posts/:id", requireAdmin, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

app.use((error, _, res, __) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

export default serverless(app);
