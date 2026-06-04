const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member", "viewer"],
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [3, "Project name must be at least 3 characters"],
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project must have an owner"],
    },
    members: {
      type: [MemberSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["planning", "active", "on_hold", "completed", "archived"],
      default: "planning",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    tags: {
      type: [String],
      default: [],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Indexes ---
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ "members.user": 1 });
ProjectSchema.index({ status: 1 });

// --- Virtual: Task count (populated separately via Task model) ---
ProjectSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "project",
  justOne: false,
});

// --- Pre-save Hook: Set completedAt when status changes to completed ---
ProjectSchema.pre("save", function () {
  if (this.isModified("status")) {
    if (this.status === "completed" && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== "completed") {
      this.completedAt = null;
    }
  }
});


// --- Instance Method: Check if a user is a member ---
ProjectSchema.methods.isMember = function (userId) {
  return (
    this.owner.equals(userId) ||
    this.members.some((m) => m.user.equals(userId))
  );
};

// --- Instance Method: Get a member's role ---
ProjectSchema.methods.getMemberRole = function (userId) {
  if (this.owner.equals(userId)) return "owner";
  const member = this.members.find((m) => m.user.equals(userId));
  return member ? member.role : null;
};

module.exports = mongoose.model("Project", ProjectSchema);