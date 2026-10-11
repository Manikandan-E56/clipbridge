import mongoose from "mongoose";

const accessKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: "Standard Access Key",
    },
    role: {
      type: String,
      enum: ["admin", "contributor", "viewer"],
      default: "viewer",
    },
    permissions: {
      canViewHistory: { type: Boolean, default: true },
      canDownloadFiles: { type: Boolean, default: true },
      canUpload: { type: Boolean, default: true },
      canDelete: { type: Boolean, default: false },
      canManageKeys: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null, // null means never expires
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: String,
      default: "Server Owner",
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify if key is currently valid
accessKeySchema.methods.isValid = function () {
  if (!this.isActive) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
};

export const AccessKey = mongoose.model("AccessKey", accessKeySchema);
