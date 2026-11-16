
import { Router } from "express";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Post from "../models/Post.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { slugify } from "../utils/slugify.js";

const router = Router();

// Generate a unique slug
async function generateUniqueSlug(name, excludeId = null) {
  const baseSlug = slugify(name) || "category";
  let slug = baseSlug;
  let counter = 1;

  while (await Category.exists({
    slug,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 })
      .lean();

    const counts = await Post.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      counts.map((item) => [String(item._id), item.count])
    );

    const result = categories.map((category) => ({
      ...category,
      post_count: countMap.get(String(category._id)) || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/categories/:idOrSlug
router.get("/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    const query = mongoose.isValidObjectId(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    const category = await Category.findOne(query).lean();

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const postCount = await Post.countDocuments({
      category: category._id,
    });

    res.json({
      ...category,
      post_count: postCount,
    });
  } catch (err) {
    console.error("Get category error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/categories
router.post(
  "/",
  requireAuth,
  requireRole("admin", "editor"),
  validate({ name: "required|min:2|max:100" }),
  async (req, res) => {
    try {
      const { name, description = "", color = "#f3ba2f", image = "" } = req.body;

      const slug = await generateUniqueSlug(name);

      const category = await Category.create({
        name,
        slug,
        description,
        color,
        image,
      });

      res.status(201).json(category);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: "Category already exists" });
      }

      console.error("Create category error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// PUT /api/categories/:id
router.put(
  "/:id",
  requireAuth,
  requireRole("admin", "editor"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: "Invalid category ID" });
      }

      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      const { name, description, color, image, status } = req.body;

      if (name !== undefined && name !== category.name) {
        category.slug = await generateUniqueSlug(name, category._id);
        category.name = name;
      }

      if (description !== undefined) category.description = description;
      if (color !== undefined) category.color = color;
      if (image !== undefined) category.image = image;
      if (status !== undefined) category.status = status;

      await category.save();

      res.json(category);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: "Category already exists" });
      }

      console.error("Update category error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// DELETE /api/categories/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: "Invalid category ID" });
      }

      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Prevent deleting a category that still has posts
      const postsUsingCategory = await Post.countDocuments({
        category: category._id,
      });

      if (postsUsingCategory > 0) {
        return res.status(409).json({
          error: "Cannot delete a category that still has posts",
        });
      }

      await category.deleteOne();

      res.json({ message: "Category deleted successfully" });
    } catch (err) {
      console.error("Delete category error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
