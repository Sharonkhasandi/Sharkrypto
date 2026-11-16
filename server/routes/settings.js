
import { Router } from "express";

import Setting from "../models/Setting.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// GET /api/settings
// Returns all settings as a flat object.
router.get("/", async (req, res) => {
  try {
    const settings = await Setting.find();

    const result = {};

    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    res.json(result);
  } catch (err) {
    console.error("Get settings error:", err);
    res.status(500).json({ error: "Failed to retrieve settings" });
  }
});

// PUT /api/settings
// Bulk update settings.
router.put(
  "/",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const updates = req.body;

      if (
        !updates ||
        typeof updates !== "object" ||
        Array.isArray(updates)
      ) {
        return res.status(400).json({
          error: "Body must be a JSON object of key-value pairs",
        });
      }

      const entries = Object.entries(updates);

      if (entries.length > 100) {
        return res.status(400).json({
          error: "You can update a maximum of 100 settings at once",
        });
      }

      for (const [key, value] of entries) {
        if (!key.trim()) {
          return res.status(400).json({
            error: "Setting keys cannot be empty",
          });
        }

        await Setting.findOneAndUpdate(
          { key },
          { $set: { value: String(value ?? "") } },
          {
            upsert: true,
            new: true,
            runValidators: true,
          }
        );
      }

      const settings = await Setting.find();
      const result = {};

      for (const setting of settings) {
        result[setting.key] = setting.value;
      }

      res.json(result);
    } catch (err) {
      console.error("Update settings error:", err);
      res.status(500).json({ error: "Failed to update settings" });
    }
  }
);

export default router;