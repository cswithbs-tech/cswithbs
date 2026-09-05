import mongoose, { Schema, Document } from 'mongoose';

export interface ICollaboration extends Document {
  title: string;
  slug: string;
  type: 'Poster' | 'Abstract';
  abstract: string;
  image?: string;
  student: mongoose.Types.ObjectId;
  event: string;
  mentor: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const CollaborationSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    type: { type: String, required: true, enum: ['Poster', 'Abstract'] },
    abstract: { type: String, required: true },
    image: { type: String }, // Optional, mainly for Poster
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: String, required: true },
    mentor: { type: String, required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

// Prevent mongoose overwrite model error in next.js dev mode
if (mongoose.models?.Collaboration) {
  delete mongoose.models.Collaboration;
}

export const Collaboration = mongoose.model<ICollaboration>('Collaboration', CollaborationSchema);
export default Collaboration;
