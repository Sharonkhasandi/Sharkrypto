import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    excerpt: {
      type: String,
      default: "",
      maxlength: 500,
    },

    content: {
      type: String,
      required: true,
    },

    featuredImage: {
      type: String,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    tags: [{
      type: String,
      trim: true,
    }],

    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
    },
    visibility: {
       type: String,
       enum: ["public", "private"],
     default: "public",
    },

    author: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User",
     required: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    scheduledAt: {
      type: Date,
      default: null,
    },

    views: {
      type: Number,
      default: 0,
    },

    seoTitle: {
      type: String,
      default: "",
    },

    seoDescription: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);
export default Post;