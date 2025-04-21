import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  parentId?: mongoose.Types.ObjectId;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post is required']
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null
    },
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1 });

export default mongoose.model<IComment>('Comment', CommentSchema); 