import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import Media from "../models/Media.js";
import { requireAuth } from "../middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "uploads");

// Ensure uploads directory exists.
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure file storage.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname).toLowerCase();

    cb(null, `${unique}${ext}`);
  },
});

// Configure upload restrictions.
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".pdf",
      ".docx",
    ];

    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
      return cb(null, true);
    }

    cb(new Error("File type not allowed"));
  },
});

const router = Router();

// Format MongoDB media records for the existing admin frontend.
function formatMedia(item) {
  return {
    id: item._id,
    _id: item._id,
    filename: item.filename,
    original: item.original,
    url: item.url,
    mime_type: item.mimeType,
    size: item.size,
    alt_text: item.altText || "",
    uploaded_by: item.uploadedBy?._id || item.uploadedBy,
    uploader_name: item.uploadedBy?.name || "",
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

// Escape special characters in search input.
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/media
router.get("/", requireAuth, async (req, res) => {
  try {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 24)
    );

    const filter = {};

    if (req.query.type && req.query.type !== "all") {
      filter.mimeType = {
        $regex: `^${escapeRegex(String(req.query.type))}/`,
        $options: "i",
      };
    }

    if (req.query.search) {
      const search = new RegExp(
        escapeRegex(String(req.query.search)),
        "i"
      );

      filter.$or = [
        { original: search },
        { altText: search },
      ];
    }

    const [items, total] = await Promise.all([
      Media.find(filter)
        .populate("uploadedBy", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),

      Media.countDocuments(filter),
    ]);

    res.json({
      data: items.map(formatMedia),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get media error:", err);
    res.status(500).json({ error: "Failed to retrieve media" });
  }
});

// POST /api/media
// Upload one or more files.
router.post(
  "/",
  requireAuth,
  upload.array("files", 20),
  async (req, res) => {
    const uploadedFiles = req.files || [];

    try {
      if (uploadedFiles.length === 0) {
        return res.status(400).json({
          error: "No files were uploaded",
        });
      }

      const host = `${req.protocol}://${req.get("host")}`;

      const mediaRecords = uploadedFiles.map((file) => ({
        filename: file.filename,
        original: file.originalname,
        url: `${host}/uploads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: req.user.id,
      }));

      const savedItems = await Media.insertMany(mediaRecords);

      res.status(201).json(savedItems.map(formatMedia));
    } catch (err) {
      console.error("Upload media error:", err);

      // Remove uploaded files if saving metadata fails.
      for (const file of uploadedFiles) {
        try {
          await fs.promises.unlink(file.path);
        } catch (cleanupError) {
          console.error("File cleanup error:", cleanupError.message);
        }
      }

      res.status(500).json({
        error: "Failed to save uploaded files",
      });
    }
  }
);

// PATCH /api/media/:id
// Update alternative text.
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Invalid media ID",
      });
    }

    const item = await Media.findByIdAndUpdate(
      id,
      {
        $set: {
          altText: req.body.alt_text || "",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("uploadedBy", "name");

    if (!item) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    res.json(formatMedia(item));
  } catch (err) {
    console.error("Update media error:", err);
    res.status(500).json({
      error: "Failed to update media",
    });
  }
});

// DELETE /api/media/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Invalid media ID",
      });
    }

    const item = await Media.findById(id);

    if (!item) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    // Remove the database record.
    await Media.findByIdAndDelete(id);

    // Remove the physical file.
    const safeFilename = path.basename(item.filename);
    const filePath = path.join(uploadDir, safeFilename);

    try {
      await fs.promises.unlink(filePath);
    } catch (fileError) {
      if (fileError.code !== "ENOENT") {
        console.error("Physical file deletion error:", fileError);
      }
    }

    res.json({
      message: "File deleted successfully",
    });
  } catch (err) {
    console.error("Delete media error:", err);
    res.status(500).json({
      error: "Failed to delete media",
    });
  }
});

export default router;