import mongoose, { Schema, models, model } from "mongoose";

const resourceSchema = new Schema(
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

    description: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: ["note", "link", "image", "file", "video"],
      required: true,
    },

    content: {
      type: String,
      default: "",
    },

    url: {
      type: String,
      default: "",
    },

    fileUrl: {
      type: String,
      default: "",
    },

    publicId: {
      type: String,
      default: "",
    },

    fileName: {
      type: String,
      default: "",
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    mimeType: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

resourceSchema.index({ userId: 1, topicId: 1, createdAt: -1 });

const Resource = models.Resource || model("Resource", resourceSchema);

export default Resource;
