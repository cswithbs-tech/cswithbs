import mongoose, { Schema, Document } from "mongoose";

export interface IAiConversation extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  pinned: boolean;
  aiModel: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AiConversationSchema = new Schema<IAiConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "New Conversation" },
    pinned: { type: Boolean, default: false },
    aiModel: { type: String, default: "gemini-3-flash-preview" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AiConversationSchema.index({ userId: 1, lastMessageAt: -1 });

export default mongoose.models.AiConversation ||
  mongoose.model<IAiConversation>("AiConversation", AiConversationSchema);
