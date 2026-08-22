import mongoose, { Schema, Document } from "mongoose";

export interface ISubject extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  level?: string;
  alignments?: string[];
  coverImage?: string;
  isRestricted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String },
    color: { type: String },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'All Levels' },
    alignments: { type: [String], default: [] },
    coverImage: { type: String, default: "" },
    isRestricted: { type: Boolean, default: undefined }, // null/undefined means fallback to tag/level logic
  },
  { timestamps: true }
);

// Prevent overwrite model error in development
export default mongoose.models.Subject ||
  mongoose.model<ISubject>("Subject", SubjectSchema);
