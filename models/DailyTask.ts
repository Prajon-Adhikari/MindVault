import mongoose, { Schema, models, model } from "mongoose";

const dailyTaskSchema = new Schema(
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

    // Array of ISO date strings "YYYY-MM-DD" when task was completed
    completedDates: {
      type: [String],
      default: [],
    },

    position: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

dailyTaskSchema.index({ userId: 1, topicId: 1, position: 1 });

const DailyTask = models.DailyTask || model("DailyTask", dailyTaskSchema);

export default DailyTask;
