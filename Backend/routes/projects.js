const express = require("express");
const Project = require("../models/Project");
const Task = require("../models/Task");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All project routes are protected
router.use(protect);

// ─── GET /api/projects ─────────────────────────────────────
// Get all projects where user is owner or member
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { "members.user": req.user._id }],
    }).populate("owner", "name email avatar");

    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/projects ────────────────────────────────────
// Create a new project
router.post("/", async (req, res) => {
  try {
    const { name, description, status, priority, dueDate, tags } = req.body;

    const project = await Project.create({
      name,
      description,
      status,
      priority,
      dueDate,
      tags,
      owner: req.user._id,
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─── GET /api/projects/:id ─────────────────────────────────
// Get a single project
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!project.isMember(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to view this project" });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/projects/:id ─────────────────────────────────
// Update a project (owner or admin only)
router.put("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const role = project.getMemberRole(req.user._id);
    if (!["owner", "admin"].includes(role)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this project" });
    }

    const { name, description, status, priority, dueDate, tags } = req.body;
    Object.assign(project, { name, description, status, priority, dueDate, tags });
    await project.save();

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─── DELETE /api/projects/:id ──────────────────────────────
// Delete a project and all its tasks (owner only)
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only the owner can delete this project" });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ success: true, message: "Project and all its tasks deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/projects/:id/members ───────────────────────
// Add a member to a project
router.post("/:id/members", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only the owner can add members" });
    }

    const { userId, role } = req.body;

    const alreadyMember = project.members.some((m) => m.user.equals(userId));
    if (alreadyMember) {
      return res.status(409).json({ success: false, message: "User is already a member" });
    }

    project.members.push({ user: userId, role: role || "member" });
    await project.save();

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─── DELETE /api/projects/:id/members/:userId ─────────────
// Remove a member from a project
router.delete("/:id/members/:userId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only the owner can remove members" });
    }

    project.members = project.members.filter(
      (m) => !m.user.equals(req.params.userId)
    );
    await project.save();

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;