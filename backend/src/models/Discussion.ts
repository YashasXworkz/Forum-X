import mongoose, { Document, Schema } from 'mongoose';

export interface IDiscussion extends Document {
  title: string;
  description: string;
  host: mongoose.Types.ObjectId;
  communityId: mongoose.Types.ObjectId;
  communityName: string;
  participants: mongoose.Types.ObjectId[];
  participantCount: number;
  status: 'active' | 'scheduled' | 'ended';
  isPrivate: boolean;
  startTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionSchema = new Schema<IDiscussion>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host is required']
    },
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: [true, 'Community is required']
    },
    communityName: {
      type: String,
      required: [true, 'Community name is required']
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    participantCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'scheduled', 'ended'],
      default: 'active'
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add the host to the participants array automatically
DiscussionSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Add host to participants if it's not already there
    if (!this.participants.includes(this.host)) {
      this.participants.push(this.host);
    }
    
    // Update participant count
    this.participantCount = this.participants.length;
  }
  next();
});

export default mongoose.model<IDiscussion>('Discussion', DiscussionSchema); 