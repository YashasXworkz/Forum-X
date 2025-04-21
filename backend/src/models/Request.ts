import mongoose, { Document, Schema } from 'mongoose';

export interface IRequest extends Document {
  item: mongoose.Types.ObjectId;
  requester: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string;
  pickupDate?: Date;
  returnDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item is required']
    },
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required']
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending'
    },
    message: {
      type: String,
      required: [true, 'Request message is required'],
      trim: true,
      minlength: [5, 'Message must be at least 5 characters long'],
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    pickupDate: {
      type: Date
    },
    returnDate: {
      type: Date,
      validate: {
        validator: function(this: IRequest, value: Date) {
          // Return date should be after pickup date if both are provided
          return !this.pickupDate || !value || value > this.pickupDate;
        },
        message: 'Return date must be after pickup date'
      }
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IRequest>('Request', RequestSchema); 