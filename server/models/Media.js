import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      unique: true,
    },
    original: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    altText: {
      type: String,
      default: "",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Media = mongoose.model("Media", mediaSchema);

export default Media;