
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/login
router.post(
  "/login",
  validate({ email: "required|email", password: "required" }),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({
        email: email.toLowerCase().trim(),
      }).select("+password");

      if (!user) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      if (user.status !== "active") {
        return res.status(403).json({
          error: "Account is inactive",
        });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      const token = jwt.sign(
        {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email role status avatar_url createdAt updatedAt"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Get current user error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/change-password
router.post(
  "/change-password",
  requireAuth,
  validate({
    current_password: "required",
    new_password: "required|min:6",
  }),
  async (req, res) => {
    try {
      const { current_password, new_password } = req.body;

      const user = await User.findById(req.user.id).select("+password");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const match = await bcrypt.compare(
        current_password,
        user.password
      );

      if (!match) {
        return res.status(400).json({
          error: "Current password is incorrect",
        });
      }

      user.password = await bcrypt.hash(new_password, 10);
      await user.save();

      res.json({
        message: "Password updated successfully",
      });
    } catch (err) {
      console.error("Change password error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
