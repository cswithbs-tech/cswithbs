import mongoose, { Schema, Document } from "mongoose";

export interface ISubject extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
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
  },
  { timestamps: true }
);

// Prevent overwrite model error in development
export default mongoose.models.Subject ||
  mongoose.model<ISubject>("Subject", SubjectSchema);
