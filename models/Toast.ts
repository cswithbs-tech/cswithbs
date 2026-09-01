import mongoose, { Schema, Document } from "mongoose";

export interface IToast extends Document {
  title: string;
  message: string;
  icon?: string; // e.g., 'feedback', 'alert', 'star', 'info'
  linkText?: string;
  linkUrl?: string;
  isActive: boolean;
  targetAudience: "ALL" | "GUESTS" | "LOGGED_IN";
  createdAt: Date;
  updatedAt: Date;
}

const ToastSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "info",
    },
    linkText: {
      type: String,
    },
    linkUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    targetAudience: {
      type: String,
      enum: ["ALL", "GUESTS", "LOGGED_IN"],
      default: "ALL",
    },
  },
  { timestamps: true }
);

ToastSchema.index({ isActive: 1 });

if (mongoose.models?.Toast) {
  delete mongoose.models.Toast;
}

export const Toast = mongoose.model<IToast>("Toast", ToastSchema);
export default Toast;
