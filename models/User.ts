import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional because of OAuth
    image: { type: String, default: 'https://placehold.co/100x100/111/FFF?text=User' },
    roles: { 
      type: [String], 
      enum: ['USER', 'PREMIUM', 'WRITER', 'ADMIN', 'SUPER_ADMIN'], 
      default: ['USER'] 
    },
    isPremium: { type: Boolean, default: false },
    premiumExpiryDate: { type: Date, default: null },
    bio: { type: String, default: '' },
    articleSignature: { type: String, default: '' },
    title: { type: String, default: '' }, // e.g. "Senior Editor"
    qualification: { type: String, default: '' }, // e.g. "PhD in Astrophysics"
    occupation: { type: String, default: '' }, // e.g. "Freelance Science Writer"
    location: { type: String, default: '' }, // e.g. "New York, USA"
    bannerImage: { type: String, default: '' },
    socialLinks: {
        twitter: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        website: { type: String, default: '' }
    },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    likedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  },
  { timestamps: true }
);

export const User = mongoose.models?.User || mongoose.model('User', UserSchema);
export default User;
