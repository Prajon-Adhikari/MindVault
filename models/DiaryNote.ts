import mongoose, { Schema, models, model } from "mongoose";

const diaryNoteSchema = new Schema(
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

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    entryDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    color: {
      type: String,
      default: "#8B5CF6", // Vibrant Violet default
    },
  },
  { timestamps: true },
);

diaryNoteSchema.index({ userId: 1, topicId: 1, entryDate: -1 });

const DiaryNote = models.DiaryNote || model("DiaryNote", diaryNoteSchema);

export default DiaryNote;
