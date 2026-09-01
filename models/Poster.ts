import mongoose, { Schema, Document } from "mongoose";

export interface IPoster extends Document {
  title: string;
  description?: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  targetAudience: "ALL" | "GUESTS" | "LOGGED_IN";
  createdAt: Date;
  updatedAt: Date;
}

const PosterSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    link: {
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

// We generally only need to fetch the single active poster
PosterSchema.index({ isActive: 1 });

if (mongoose.models?.Poster) {
  delete mongoose.models.Poster;
}

export const Poster = mongoose.model<IPoster>("Poster", PosterSchema);
export default Poster;
