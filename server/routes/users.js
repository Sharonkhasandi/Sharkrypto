
import { Router } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const safeUserFields = "name email role status avatar_url createdAt updatedAt";

// GET /api/users — admin only
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find()
      .select(safeUserFields)
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/users/:id
router.get("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(req.params.id).select(safeUserFields);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/users — admin only
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validate({
    name: "required|min:2|max:120",
    email: "required|email",
    password: "required|min:6",
    role: "required",
  }),
  async (req, res) => {
    try {
      const { name, email, password, role, status = "active" } = req.body;

      if (!["admin", "editor", "author"].includes(role)) {
        return res.status(400).json({ error: "Invalid user role" });
      }

      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ error: "Invalid account status" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const existing = await User.findOne({ email: normalizedEmail });

      if (existing) {
        return res.status(409).json({ error: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        status,
      });

      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: "Email already in use" });
      }

      console.error("Create user error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// PUT /api/users/:id — admin only
router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(id).select("+password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { name, email, role, status, password } = req.body;

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();

      const duplicate = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({ error: "Email already in use" });
      }

      user.email = normalizedEmail;
    }

    if (name !== undefined) user.name = name;

    if (role !== undefined) {
      if (!["admin", "editor", "author"].includes(role)) {
        return res.status(400).json({ error: "Invalid user role" });
      }
      user.role = role;
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ error: "Invalid account status" });
      }
      user.status = status;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters",
        });
      }

      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already in use" });
    }

    console.error("Update user error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/users/:id — admin only, cannot delete self
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (id === req.user.id) {
      return res.status(400).json({
        error: "Cannot delete your own account",
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
