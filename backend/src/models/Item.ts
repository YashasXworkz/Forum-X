import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
  name: string;
  description: string;
  category: string;
  condition: string;
  images: string[];
  owner: mongoose.Types.ObjectId;
  isAvailable: boolean;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      minlength: [3, 'Item name must be at least 3 characters long'],
      maxlength: [100, 'Item name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Electronics', 'Furniture', 'Clothing', 'Books', 'Tools', 'Kitchen', 'Sports', 'Games', 'Other']
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
    },
    images: {
      type: [String],
      default: []
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Item must have an owner']
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    location: {
      type: String,
      required: [true, 'Location is required']
    }
  },
  {
    timestamps: true
  }
);

// Index for search
ItemSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.model<IItem>('Item', ItemSchema); 