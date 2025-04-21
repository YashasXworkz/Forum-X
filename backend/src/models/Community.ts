import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunity extends Document {
  name: string;
  slug: string;
  description: string;
  creator: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  memberCount: number;
  category: string;
  imageUrl?: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommunitySchema = new Schema<ICommunity>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      unique: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    memberCount: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add the creator to the members array automatically
CommunitySchema.pre('save', async function(next) {
  if (this.isNew) {
    // Add creator to members if it's not already there
    if (!this.members.includes(this.creator)) {
      this.members.push(this.creator);
    }
    
    // Update member count
    this.memberCount = this.members.length;
    
    // Generate slug from name if not provided
    if (!this.slug) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
    }
  }
  next();
});

export default mongoose.model<ICommunity>('Community', CommunitySchema); 