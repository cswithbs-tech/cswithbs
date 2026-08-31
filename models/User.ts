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
    occupation: { type: String, default: 'Student' }, // e.g. "Freelance Science Writer"
    degree: { type: String, default: '' }, // e.g. "MCA (Master of Computer Applications)"
    university: { type: String, default: '' },
    semester: { type: String, default: '' },
    year: { type: String, default: '' },
    location: { type: String, default: '' }, // e.g. "New York, USA"
    bannerImage: { type: String, default: '' },
    isCourseRestricted: { type: Boolean, default: false }, // Used to block users from courses if identity verification fails
    socialLinks: {
        twitter: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        facebook: { type: String, default: '' },
        website: { type: String, default: '' }
    },
    readNotifications: [{ type: Schema.Types.ObjectId, ref: 'Notification' }],
    hiddenNotifications: [{ type: Schema.Types.ObjectId, ref: 'Notification' }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    bookmarkedNotes: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
    likedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  },
  { timestamps: true }
);

// Delete the model if it exists to ensure schema updates take effect in dev
if (mongoose.models?.User) {
  delete mongoose.models.User;
}

export const User = mongoose.model('User', UserSchema);
export default User;
