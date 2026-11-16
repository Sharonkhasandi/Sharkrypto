import { Router } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import Post from "../models/Post.js";
import Category from "../models/Category.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { slugify } from "../utils/slugify.js";

const router = Router();

// Check an optional JWT. An invalid or missing token gets public access only.
function getOptionalUser(req) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) return null;

  try {
    return jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// Escape special characters before using a search term in a regular expression.
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Generate a unique slug.
async function generateUniqueSlug(title, excludeId = null) {
  const baseSlug = slugify(title) || "post";
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const filter = { slug: candidate };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const existing = await Post.exists(filter);

    if (!existing) return candidate;

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

// Normalize tags into unique strings.
function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];

  return [
    ...new Set(
      tags
        .map((tag) => String(tag).trim())
        .filter(Boolean)
    ),
  ];
}

// Convert MongoDB documents into the API response format.
function formatPost(post) {
  const category = post.category || null;
  const author = post.author || null;

  return {
    id: post._id,
    _id: post._id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,

    featured_image: post.featuredImage || "",

    category_id: category?._id || null,
    category_name: category?.name || "",
    category_slug: category?.slug || "",
    category_color: category?.color || "#f3ba2f",

    author_id: author?._id || post.author,
    author_name: author?.name || "",

    tags: post.tags || [],

    status: post.status,
    visibility: post.visibility,

    published_at: post.publishedAt || null,
    scheduled_at: post.scheduledAt || null,

    views: post.views || 0,

    meta_title: post.seoTitle || "",
    meta_desc: post.seoDescription || "",

    created_at: post.createdAt,
    updated_at: post.updatedAt,
  };
}

function populatePost(query) {
  return query
    .populate("category", "name slug color")
    .populate("author", "name");
}

// GET /api/posts
// Public visitors see published public posts.
// Admins and editors can see all posts.
// Authors can see their own posts and public published posts.
router.get("/", async (req, res) => {
  try {
    const user = getOptionalUser(req);

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );
    const skip = (page - 1) * limit;

    const filter = {};

    if (!user) {
      filter.status = "published";
      filter.visibility = "public";
    } else if (user.role === "admin" || user.role === "editor") {
      if (req.query.status) {
        filter.status = req.query.status;
      }
    } else {
      filter.$or = [
        { status: "published", visibility: "public" },
        { author: user.id },
      ];

      if (req.query.status) {
        filter.$or = [
          {
            status: "published",
            visibility: "public",
          },
          {
            author: user.id,
            status: req.query.status,
          },
        ];
      }
    }

    // Filter by category slug.
    if (req.query.category) {
      const category = await Category.findOne({
        slug: req.query.category,
      }).select("_id");

      if (!category) {
        return res.json({
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        });
      }

      filter.category = category._id;
    }

    // Search by title or excerpt.
    if (req.query.search) {
      const search = new RegExp(
        escapeRegex(String(req.query.search)),
        "i"
      );

      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { title: search },
            { excerpt: search },
          ],
        },
      ];
    }

    const allowedSortFields = {
      published_at: "publishedAt",
      created_at: "createdAt",
      views: "views",
      title: "title",
    };

    const sortField =
      allowedSortFields[req.query.sort] || "publishedAt";

    const sortOrder =
      String(req.query.order).toUpperCase() === "ASC" ? 1 : -1;

    const [posts, total] = await Promise.all([
      populatePost(
        Post.find(filter)
          .sort({ [sortField]: sortOrder, createdAt: -1 })
          .skip(skip)
          .limit(limit)
      ),
      Post.countDocuments(filter),
    ]);

    res.json({
      data: posts.map(formatPost),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ error: "Failed to retrieve posts" });
  }
});

// GET /api/posts/:idOrSlug
router.get("/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const user = getOptionalUser(req);

    const identifier = mongoose.isValidObjectId(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    const post = await populatePost(
      Post.findOne(identifier)
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isPrivileged =
      user && ["admin", "editor"].includes(user.role);

    const isAuthor =
      user && String(post.author?._id || post.author) === String(user.id);

    const isPublic =
      post.status === "published" &&
      post.visibility === "public";

    if (!isPublic && !isPrivileged && !isAuthor) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Count views only for public visitors.
    if (isPublic && !isPrivileged && !isAuthor) {
      await Post.updateOne(
        { _id: post._id },
        { $inc: { views: 1 } }
      );

      post.views += 1;
    }

    res.json({ data: formatPost(post) });
  } catch (err) {
    console.error("Get post error:", err);
    res.status(500).json({ error: "Failed to retrieve post" });
  }
});

// POST /api/posts
router.post(
  "/",
  requireAuth,
  validate({
    title: "required|max:200",
    content: "required",
  }),
  async (req, res) => {
    try {
      const {
        title,
        slug,
        excerpt,
        content,
        featured_image,
        category_id,
        tags,
        status,
        visibility,
        scheduled_at,
        meta_title,
        meta_desc,
      } = req.body;

      const allowedStatuses = ["draft", "published", "scheduled"];
      const allowedVisibility = ["public", "private"];

      const postStatus = status || "draft";
      const postVisibility = visibility || "public";

      if (!allowedStatuses.includes(postStatus)) {
        return res.status(422).json({
          error: "Invalid post status",
        });
      }

      if (!allowedVisibility.includes(postVisibility)) {
        return res.status(422).json({
          error: "Invalid post visibility",
        });
      }

      let category = null;

      if (category_id) {
        if (!mongoose.isValidObjectId(category_id)) {
          return res.status(422).json({
            error: "Invalid category ID",
          });
        }

        category = await Category.findById(category_id);

        if (!category) {
          return res.status(404).json({
            error: "Category not found",
          });
        }
      }

      const postSlug = await generateUniqueSlug(slug || title);

      const post = await Post.create({
        title,
        slug: postSlug,
        excerpt: excerpt || "",
        content,
        featuredImage: featured_image || "",
        category: category?._id || null,
        tags: normalizeTags(tags),
        status: postStatus,
        visibility: postVisibility,
        author: req.user.id,
        publishedAt:
          postStatus === "published" ? new Date() : null,
        scheduledAt: scheduled_at ? new Date(scheduled_at) : null,
        seoTitle: meta_title || "",
        seoDescription: meta_desc || "",
      });

      const savedPost = await populatePost(
        Post.findById(post._id)
      );

      res.status(201).json({
        message: "Post created successfully",
        data: formatPost(savedPost),
      });
    } catch (err) {
      console.error("Create post error:", err);
      res.status(500).json({ error: "Failed to create post" });
    }
  }
);

// PUT /api/posts/:id
router.put(
  "/:id",
  requireAuth,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          error: "Invalid post ID",
        });
      }

      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({
          error: "Post not found",
        });
      }

      const isPrivileged = ["admin", "editor"].includes(req.user.role);
      const isAuthor = String(post.author) === String(req.user.id);

      if (!isPrivileged && !isAuthor) {
        return res.status(403).json({
          error: "You can only edit your own posts",
        });
      }

      const {
        title,
        slug,
        excerpt,
        content,
        featured_image,
        category_id,
        tags,
        status,
        visibility,
        scheduled_at,
        meta_title,
        meta_desc,
      } = req.body;

      if (title !== undefined) {
        if (!String(title).trim() || String(title).length > 200) {
          return res.status(422).json({
            error: "Title is required and must not exceed 200 characters",
          });
        }

        post.title = title;
      }

      if (slug !== undefined || title !== undefined) {
        post.slug = await generateUniqueSlug(
          slug || post.title,
          post._id
        );
      }

      if (excerpt !== undefined) post.excerpt = excerpt;
      if (content !== undefined) post.content = content;
      if (featured_image !== undefined) {
        post.featuredImage = featured_image;
      }

      if (category_id !== undefined) {
        if (!category_id) {
          post.category = null;
        } else {
          if (!mongoose.isValidObjectId(category_id)) {
            return res.status(422).json({
              error: "Invalid category ID",
            });
          }

          const category = await Category.findById(category_id);

          if (!category) {
            return res.status(404).json({
              error: "Category not found",
            });
          }

          post.category = category._id;
        }
      }

      if (tags !== undefined) {
        post.tags = normalizeTags(tags);
      }

      if (status !== undefined) {
        if (!["draft", "published", "scheduled"].includes(status)) {
          return res.status(422).json({
            error: "Invalid post status",
          });
        }

        if (status === "published" && post.status !== "published") {
          post.publishedAt = new Date();
        }

        post.status = status;
      }

      if (visibility !== undefined) {
        if (!["public", "private"].includes(visibility)) {
          return res.status(422).json({
            error: "Invalid post visibility",
          });
        }

        post.visibility = visibility;
      }

      if (scheduled_at !== undefined) {
        post.scheduledAt = scheduled_at
          ? new Date(scheduled_at)
          : null;
      }

      if (meta_title !== undefined) post.seoTitle = meta_title;
      if (meta_desc !== undefined) post.seoDescription = meta_desc;

      await post.save();

      const updatedPost = await populatePost(
        Post.findById(post._id)
      );

      res.json({
        message: "Post updated successfully",
        data: formatPost(updatedPost),
      });
    } catch (err) {
      console.error("Update post error:", err);
      res.status(500).json({ error: "Failed to update post" });
    }
  }
);

// DELETE /api/posts
// Bulk delete — admin and editor only.
router.delete(
  "/",
  requireAuth,
  requireRole("admin", "editor"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(422).json({
          error: "Provide an array of post IDs",
        });
      }

      if (!ids.every((id) => mongoose.isValidObjectId(id))) {
        return res.status(422).json({
          error: "One or more post IDs are invalid",
        });
      }

      const result = await Post.deleteMany({
        _id: { $in: ids },
      });

      res.json({
        message: "Posts deleted successfully",
        deletedCount: result.deletedCount,
      });
    } catch (err) {
      console.error("Bulk delete posts error:", err);
      res.status(500).json({
        error: "Failed to delete posts",
      });
    }
  }
);

// DELETE /api/posts/:id
// Single delete — admin and editor only.
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "editor"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          error: "Invalid post ID",
        });
      }

      const post = await Post.findByIdAndDelete(id);

      if (!post) {
        return res.status(404).json({
          error: "Post not found",
        });
      }

      res.json({
        message: "Post deleted successfully",
      });
    } catch (err) {
      console.error("Delete post error:", err);
      res.status(500).json({
        error: "Failed to delete post",
      });
    }
  }
);

export default router;