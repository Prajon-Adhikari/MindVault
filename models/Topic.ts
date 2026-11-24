import mongoose, { Schema, models, model } from "mongoose";

const topicSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    color: {
      type: String,
      default: "#D4A373",
    },

    icon: {
      type: String,
      default: "folder",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    deadline: {
      type: Date,
      default: null,
    },

    // Daily reminder settings
    reminderTime: {
      type: String,
      default: "",
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },

    timezone: {
      type: String,
      default: "Asia/Kathmandu",
    },

    notifyByEmail: {
      type: Boolean,
      default: false,
    },

    // Prevent sending the same daily reminder more than once
    reminderLastSentFor: {
      type: String,
      default: "",
    },

    reminderClaimedFor: {
      type: String,
      default: "",
    },

    reminderClaimedAt: {
      type: Date,
      default: null,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

topicSchema.index({ userId: 1, createdAt: -1 });
topicSchema.index({
  reminderTime: 1,
  notifyByEmail: 1,
  isArchived: 1,
});

const Topic = models.Topic || model("Topic", topicSchema);

export default Topic;
