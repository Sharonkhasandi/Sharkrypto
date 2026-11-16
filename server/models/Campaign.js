import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
      trim: true,
    },
    body: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "sent"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    recipients: {
      type: Number,
      default: 0,
    },
    openRate: {
      type: Number,
      default: 0,
    },
    clickRate: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;