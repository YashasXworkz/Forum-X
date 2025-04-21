import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  communityId: mongoose.Types.ObjectId;
  imageUrl?: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [10000, 'Content cannot be more than 10000 characters']
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: [true, 'Community is required']
    },
    imageUrl: {
      type: String,
      trim: true
    },
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    commentCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export default mongoose.model<IPost>('Post', PostSchema); 