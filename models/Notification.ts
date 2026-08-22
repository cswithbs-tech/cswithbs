import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  type: "GENERAL" | "PERSONAL" | "NEW_BLOG" | "NEW_COURSE";
  recipient: mongoose.Types.ObjectId | null; // null for global broadcast
  title: string;
  message: string;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["GENERAL", "PERSONAL", "NEW_BLOG", "NEW_COURSE"],
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // null means broadcast to everyone
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String, // Optional URL to redirect to on click
    },
  },
  { timestamps: true }
);

// Indexing for faster retrieval. We usually query by recipient (null or userId) and sort by createdAt.
NotificationSchema.index({ recipient: 1, createdAt: -1 });

// TTL Index: Automatically delete documents 30 days after creation
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Delete the model if it exists to ensure schema updates take effect in dev
if (mongoose.models?.Notification) {
  delete mongoose.models.Notification;
}

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
