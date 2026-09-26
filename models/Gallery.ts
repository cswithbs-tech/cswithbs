import mongoose, { Schema, Document } from "mongoose";

export interface IGallery extends Document {
  title?: string;
  description?: string;
  imageUrl: string;
  publicId?: string; // from Cloudinary
  isActive: boolean;
  order: number;
  uploadedBy: any; // Populated User | ObjectId
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema: Schema = new Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    publicId: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Gallery ||
  mongoose.model<IGallery>("Gallery", GallerySchema);
