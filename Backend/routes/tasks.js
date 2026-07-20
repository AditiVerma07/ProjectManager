const express = require("express");
const Task = require("../Models/task");
const Project = require("../Models/project");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);


// ─── GET /api/tasks ────────────────────
// Get all tasks for a project OR all tasks for the logged-in user globally
router.get("/", async (req, res) => {
  try {
    const { project, status, priority, assignee } = req.query;
    const filter = {};

    // Scenario A: User requested a specific project's tasks
    if (project) {
      const projectDoc = await Project.findById(project);
      if (!projectDoc || !projectDoc.isMember(req.user._id)) {
        return res.status(403).json({ success: false, message: "Not authorized to view tasks for this project" });
      }
      filter.project = project;
    } 
    // Scenario B: User clicked global "My Tasks" from the sidebar
    else {
      // Find all projects where this user is a member
      const userProjects = await Project.find({ members: req.user._id });
      const projectIds = userProjects.map(p => p._id);
      
      // Filter tasks belonging to those projects OR created by this user
      filter.$or = [
        { project: { $in: projectIds } },
        { createdBy: req.user._id }
      ];
    }

    // Apply optional additional sidebar filtering options dynamically
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignees = assignee;

    const tasks = await Task.find(filter)
      .populate("project", "name") // ✅ Added: lets you display project tags in the global list!
      .populate("assignees", "name email avatar")
      .populate("createdBy", "name email")
      .sort({ order: 1, createdAt: -1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ─── POST /api/tasks ───────────────────────────────────────
// Create a new task
router.post("/", async (req, res) => {
  try {
    const { title, description, project, assignees, status, priority, dueDate, estimatedHours, tags, parentTask } = req.body;

    const projectDoc = await Project.findById(project);
    if (!projectDoc || !projectDoc.isMember(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to add tasks to this project" });
    }

    const task = await Task.create({
      title, description, project, assignees, status,
      priority, dueDate, estimatedHours, tags, parentTask,
      createdBy: req.user._id,
    });

    await task.populate("assignees", "name email avatar");
    await task.populate("createdBy", "name email");

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─── GET /api/tasks/:id ────────────────────────────────────
// Get a single task
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignees", "name email avatar")
      .populate("createdBy", "name email")
      .populate("comments.author", "name email avatar");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project || !project.isMember(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to view this task" });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/tasks/:id ────────────────────────────────────
// Update a task
// ─── PUT /api/tasks/:id ────────────────────────────────────
// Update a task (handles partial updates cleanly for drag and drop)
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project || !project.isMember(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this task" });
    }

    // ✅ FIXED: Safely loop and update ONLY fields that are actually sent in the request body
    // This stops drag-and-drop operations from deleting fields like 'title'
    const allowedUpdates = [
      "title", "description", "assignees", "status", 
      "priority", "dueDate", "estimatedHours", "loggedHours", "tags", "order"
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save(); // Fires schema pre-hooks automatically
    await task.populate("assignees", "name email avatar");

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// ─── DELETE /api/tasks/:id ─────────────────────────────────
// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    const role = project.getMemberRole(req.user._id);

    if (!["owner", "admin"].includes(role) && !task.createdBy.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this task" });
    }

    await task.deleteOne();
    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/tasks/:id/comments ─────────────────────────
// Add a comment to a task
router.post("/:id/comments", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project || !project.isMember(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to comment on this task" });
    }

    task.comments.push({ author: req.user._id, content: req.body.content });
    await task.save();
    await task.populate("comments.author", "name email avatar");

    res.status(201).json({ success: true, data: task.comments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;