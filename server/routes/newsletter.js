import { Router } from "express";
import mongoose from "mongoose";

import Subscriber from "../models/Subscriber.js";
import Campaign from "../models/Campaign.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

// Format subscriber response for the existing frontend.
function formatSubscriber(item) {
  return {
    id: item._id,
    email: item.email,
    status: item.status,
    confirmed_at: item.confirmedAt,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

// Format campaign response for the existing frontend.
function formatCampaign(item) {
  return {
    id: item._id,
    subject: item.subject,
    body: item.body,
    status: item.status,
    created_by: item.createdBy?._id || item.createdBy,
    author_name: item.createdBy?.name || "",
    sent_at: item.sentAt,
    recipients: item.recipients,
    open_rate: item.openRate,
    click_rate: item.clickRate,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

// ─────────────────────────────────────────────
// SUBSCRIBERS
// ─────────────────────────────────────────────

// GET /api/newsletter/subscribers
router.get(
  "/subscribers",
  requireAuth,
  requireRole("admin", "editor"),
  async (req, res) => {
    try {
      const page = Math.max(
        1,
        Number.parseInt(req.query.page, 10) || 1
      );

      const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(req.query.limit, 10) || 50)
      );

      const filter = {};

      if (req.query.status) {
        filter.status = req.query.status;
      }

      if (req.query.search) {
        filter.email = {
          $regex: String(req.query.search).replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          ),
          $options: "i",
        };
      }

      const [subscribers, total] = await Promise.all([
        Subscriber.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),

        Subscriber.countDocuments(filter),
      ]);

      res.json({
        data: subscribers.map(formatSubscriber),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error("Get subscribers error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// POST /api/newsletter/subscribe
// Public newsletter subscription.
router.post(
  "/subscribe",
  validate({ email: "required|email" }),
  async (req, res) => {
    try {
      const email = req.body.email.toLowerCase().trim();

      const subscriber = await Subscriber.findOneAndUpdate(
        { email },
        {
          $set: {
            status: "active",
            confirmedAt: new Date(),
          },
          $setOnInsert: {
            email,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      res.json({
        message: "Subscribed successfully",
        subscriber: formatSubscriber(subscriber),
      });
    } catch (err) {
      console.error("Subscribe error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// DELETE /api/newsletter/subscribers/:id
router.delete(
  "/subscribers/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          error: "Invalid subscriber ID",
        });
      }

      const subscriber = await Subscriber.findByIdAndDelete(id);

      if (!subscriber) {
        return res.status(404).json({
          error: "Subscriber not found",
        });
      }

      res.json({
        message: "Subscriber removed successfully",
      });
    } catch (err) {
      console.error("Delete subscriber error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ─────────────────────────────────────────────
// CAMPAIGNS
// ─────────────────────────────────────────────

// GET /api/newsletter/campaigns
router.get(
  "/campaigns",
  requireAuth,
  async (req, res) => {
    try {
      const campaigns = await Campaign.find()
        .populate("createdBy", "name")
        .sort({ createdAt: -1 });

      res.json(campaigns.map(formatCampaign));
    } catch (err) {
      console.error("Get campaigns error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// POST /api/newsletter/campaigns
router.post(
  "/campaigns",
  requireAuth,
  requireRole("admin", "editor"),
  validate({
    subject: "required|min:3|max:255",
  }),
  async (req, res) => {
    try {
      const { subject, body = "" } = req.body;

      const campaign = await Campaign.create({
        subject,
        body,
        status: "draft",
        createdBy: req.user.id,
      });

      const savedCampaign = await Campaign.findById(campaign._id)
        .populate("createdBy", "name");

      res.status(201).json(formatCampaign(savedCampaign));
    } catch (err) {
      console.error("Create campaign error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// POST /api/newsletter/campaigns/:id/send
router.post(
  "/campaigns/:id/send",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          error: "Invalid campaign ID",
        });
      }

      const campaign = await Campaign.findById(id);

      if (!campaign) {
        return res.status(404).json({
          error: "Campaign not found",
        });
      }

      if (campaign.status === "sent") {
        return res.status(400).json({
          error: "This campaign has already been marked as sent",
        });
      }

      const total = await Subscriber.countDocuments({
        status: "active",
      });

      // This records campaign status only.
      // Actual email delivery will require an email service integration.
      campaign.status = "sent";
      campaign.sentAt = new Date();
      campaign.recipients = total;
      campaign.openRate = 0;
      campaign.clickRate = 0;

      await campaign.save();

      const savedCampaign = await Campaign.findById(id)
        .populate("createdBy", "name");

      res.json({
        message: `Campaign marked as sent to ${total} subscribers`,
        campaign: formatCampaign(savedCampaign),
        emailDelivery: "Not configured",
      });
    } catch (err) {
      console.error("Send campaign error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;