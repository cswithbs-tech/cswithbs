import mongoose, { Schema, Document } from "mongoose";

export interface IChapter extends Document {
  name: string;
  slug: string;
  subject: any; // Populated Subject | ObjectId
  order: number;
  description?: string;
  resources?: {
    _id?: string;
    title: string;
    type: "PDF" | "Image" | "Link" | "Document";
    url: string;
    isPremium: boolean;
    createdAt: Date;
  }[];
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
    resources: [
      {
        title: { type: String, required: true },
        type: { type: String, enum: ["PDF", "Image", "Link", "Document"], required: true },
        url: { type: String, required: true },
        isPremium: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Prevent overwrite model error in development
export default mongoose.models.Chapter ||
  mongoose.model<IChapter>("Chapter", ChapterSchema);
