const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [3, "Task title must be at least 3 characters"],
      maxlength: [150, "Task title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Task must belong to a project"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task must have a creator"],
    },
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["backlog", "todo", "in_progress", "in_review", "done", "cancelled"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    estimatedHours: {
      type: Number,
      min: [0, "Estimated hours cannot be negative"],
      default: null,
    },
    loggedHours: {
      type: Number,
      min: [0, "Logged hours cannot be negative"],
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    attachments: [
      {
        filename: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    comments: {
      type: [CommentSchema],
      default: [],
    },
    // Support for sub-tasks
    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    order: {
      type: Number,
      default: 0, // Used for drag-and-drop ordering within a status column
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Indexes ---
TaskSchema.index({ project: 1, status: 1 });
TaskSchema.index({ assignees: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ parentTask: 1 });

// --- Virtual: Sub-tasks ---
TaskSchema.virtual("subTasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "parentTask",
});

// --- Virtual: Is overdue ---
TaskSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate || this.status === "done" || this.status === "cancelled") {
    return false;
  }
  return new Date() > this.dueDate;
});

// --- Pre-save Hook: Set completedAt when status is done ---
TaskSchema.pre("save", function () {
  if (this.isModified("status")) {
    if (this.status === "done" && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== "done") {
      this.completedAt = null;
    }
  }
  
});

module.exports = mongoose.model("Task", TaskSchema);