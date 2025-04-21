import mongoose, { Document, Schema } from 'mongoose';

export interface IDiscussionMessage extends Document {
  discussionId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderUsername: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionMessageSchema = new Schema<IDiscussionMessage>(
  {
    discussionId: {
      type: Schema.Types.ObjectId,
      ref: 'Discussion',
      required: [true, 'Discussion ID is required'],
      index: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required']
    },
    senderUsername: {
      type: String,
      required: [true, 'Sender username is required']
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
DiscussionMessageSchema.index({ discussionId: 1, createdAt: -1 });
DiscussionMessageSchema.index({ sender: 1 });

export default mongoose.model<IDiscussionMessage>('DiscussionMessage', DiscussionMessageSchema); 