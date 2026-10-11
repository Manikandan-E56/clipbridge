import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    relativePath: { type: String, required: true },
    downloadUrl: { type: String, required: true },
  },
  { _id: false }
);

const senderSchema = new mongoose.Schema(
  {
    deviceId: { type: String, default: "unknown" },
    deviceName: { type: String, default: "Anonymous Device" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { _id: false }
);

const sharedItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "link", "image", "video", "audio", "document", "other"],
      required: true,
      default: "text",
      index: true,
    },
    content: {
      type: String,
      default: "",
    },
    file: {
      type: fileSchema,
      default: null,
    },
    sender: {
      type: senderSchema,
      default: () => ({}),
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying recent items and historical filters
sharedItemSchema.index({ createdAt: -1 });
sharedItemSchema.index({ type: 1, createdAt: -1 });

export const SharedItem = mongoose.model("SharedItem", sharedItemSchema);
