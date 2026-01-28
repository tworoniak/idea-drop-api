import express from "express";
import mongoose from "mongoose";
import Idea from "../models/Idea.js";

const router = express.Router();

// @route   GET /api/ideas
// @desc    Get all ideas
// @access  Public
// @query   _limit (optional limit for ideas returned)
router.get("/", async (req, res, next) => {
  try {
    const limit = parseInt(req.query._limit);
    const query = Idea.find().sort({ createdAt: -1 });

    if (!isNaN(limit)) {
      query.limit(limit);
    }

    const ideas = await query.exec();
    res.json(ideas);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/ideas/:id
// @desc    Get single idea
// @access  Public
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(Object.assign(new Error("Idea Not Found"), { status: 404 }));
    }

    const idea = await Idea.findById(id);
    if (!idea) {
      return next(Object.assign(new Error("Idea Not Found"), { status: 404 }));
    }

    res.json(idea);
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/ideas
// @desc    Create new idea
// @access  Public
router.post("/", async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body;

    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      return next(
        Object.assign(
          new Error("Title, summary, and description are required"),
          { status: 400 },
        ),
      );
    }

    const newIdea = new Idea({
      title,
      summary,
      description,
      tags:
        typeof tags === "string"
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : Array.isArray(tags)
            ? tags
            : [],
    });

    const savedIdea = await newIdea.save();
    res.status(201).json(savedIdea);
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/ideas/:id
// @desc    Delete single idea
// @access  Public
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(Object.assign(new Error("Idea Not Found"), { status: 404 }));
    }

    const idea = await Idea.findByIdAndDelete(id);
    if (!idea) {
      return next(Object.assign(new Error("Idea Not Found"), { status: 404 }));
    }

    res.json({ message: "Idea deleted succeffuly" });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/ideas/:id
// @desc    Update single idea
// @access  Public
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(Object.assign(new Error("Idea Not Found"), { status: 400 }));
    }

    const { title, summary, description, tags } = req.body;

    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      return next(
        Object.assign(
          new Error("Title, summary, and description are required"),
          { status: 400 },
        ),
      );
    }

    const updatedIdea = await Idea.findByIdAndUpdate(
      id,
      {
        title,
        summary,
        description,
        tags:
          typeof tags === "string"
            ? tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : Array.isArray(tags)
              ? tags
              : [],
      },
      { new: true, runValidators: true },
    );

    if (!updatedIdea) {
      return next(Object.assign(new Error("Idea Not Found"), { status: 404 }));
    }

    res.json(updatedIdea);
  } catch (err) {
    next(err);
  }
});

export default router;
