import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: 'request' | 'acceptance' | 'rejection' | 'return' | 'message' | 'review';
  content: string;
  relatedItem?: mongoose.Types.ObjectId;
  relatedRequest?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required']
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required']
    },
    type: {
      type: String,
      enum: ['request', 'acceptance', 'rejection', 'return', 'message', 'review'],
      required: [true, 'Notification type is required']
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [200, 'Content cannot exceed 200 characters']
    },
    relatedItem: {
      type: Schema.Types.ObjectId,
      ref: 'Item'
    },
    relatedRequest: {
      type: Schema.Types.ObjectId,
      ref: 'Request'
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Automatically expire notifications after 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model<INotification>('Notification', NotificationSchema); 