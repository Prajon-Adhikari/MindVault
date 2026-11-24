import mongoose, { Schema, models, model } from "mongoose";

const topicTaskSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    position: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

topicTaskSchema.index({ userId: 1, topicId: 1, position: 1 });

const TopicTask = models.TopicTask || model("TopicTask", topicTaskSchema);

export default TopicTask;
