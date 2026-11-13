import mongoose, { Schema, Document } from "mongoose";

export interface IAiMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: {
    type?: "chat" | "draft_note" | "draft_post" | "review_report" | "gap_audit";
    draftData?: {
      title?: string;
      slug?: string;
      excerpt?: string;
      content?: string;
      tags?: string[];
      subjectId?: string;
      subjectName?: string;
      chapterId?: string;
      chapterName?: string;
      contentType?: "post" | "note";
      order?: number;
    };
    reviewData?: {
      postId?: string;
      postTitle?: string;
      authorName?: string;
      score?: number;
      verdict?: "APPROVE" | "NEEDS_REVISION" | "REJECT";
      summary?: string;
      strengths?: string[];
      issues?: string[];
      suggestions?: string[];
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const AiMessageSchema = new Schema<IAiMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "AiConversation", required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

AiMessageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.models.AiMessage ||
  mongoose.model<IAiMessage>("AiMessage", AiMessageSchema);
