import mongoose, { Schema, Document } from "mongoose";

export interface IChapter extends Document {
  name: string;
  slug: string;
  subject: any; // Populated Subject | ObjectId
  order: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    order: { type: Number, default: 0 },
    description: { type: String },
  },
  { timestamps: true }
);

// Prevent overwrite model error in development
export default mongoose.models.Chapter ||
  mongoose.model<IChapter>("Chapter", ChapterSchema);
