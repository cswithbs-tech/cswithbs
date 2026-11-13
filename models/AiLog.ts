import mongoose, { Schema, Document } from "mongoose";

export interface IAiLog extends Document {
  userId?: mongoose.Types.ObjectId;
  userName?: string;
  userEmail?: string;
  topic: string;
  contentType: "post" | "note";
  categoryOrSubject?: string;
  targetLevel?: string;
  modelUsed: string;
  hasCoverImage: boolean;
  coverImageUrl?: string;
  title: string;
  slug: string;
  charactersCount: number;
  status: "success" | "failed";
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AiLogSchema = new Schema<IAiLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, default: "Anonymous Writer" },
    userEmail: { type: String, default: "" },
    topic: { type: String, required: true },
    contentType: { type: String, enum: ["post", "note"], default: "post" },
    categoryOrSubject: { type: String, default: "" },
    targetLevel: { type: String, default: "" },
    modelUsed: { type: String, default: "gemini-flash-lite-latest" },
    hasCoverImage: { type: Boolean, default: false },
    coverImageUrl: { type: String, default: "" },
    title: { type: String, default: "" },
    slug: { type: String, default: "" },
    charactersCount: { type: Number, default: 0 },
    status: { type: String, enum: ["success", "failed"], default: "success" },
    error: { type: String, default: "" },
  },
  { timestamps: true }
);

AiLogSchema.index({ createdAt: -1 });
AiLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.AiLog || mongoose.model<IAiLog>("AiLog", AiLogSchema);
