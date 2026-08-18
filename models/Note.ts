import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentJson?: any;
  subject: any; // Populated Subject | ObjectId
  chapter?: any; // Populated Chapter | ObjectId
  order?: number; // Position within the chapter
  language: string;
  image?: string;
  author: any; // Populated User | ObjectId
  tags: string[];
  readTime: string;
  views: number;
  likes: number;
  featured: boolean;
  status: "draft" | "published" | "archived" | "scheduled";
  scheduledPublishDate?: Date;
  // SEO Metadata
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noindex?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    contentJson: { type: Schema.Types.Mixed },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    chapter: { type: Schema.Types.ObjectId, ref: "Chapter" },
    order: { type: Number, default: 0 },
    language: { type: String, default: "English" },
    image: { type: String }, // Optional for notes, unlike posts
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: { type: [String], default: [] },
    readTime: { type: String, required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published", "archived", "scheduled"],
      default: "draft",
    },
    scheduledPublishDate: { type: Date },
    seoTitle: { type: String },
    seoDescription: { type: String },
    canonicalUrl: { type: String },
    ogImage: { type: String },
    noindex: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Prevent overwrite model error in development
export default mongoose.models.Note ||
  mongoose.model<INote>("Note", NoteSchema);
