import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    attendeeName: {
      type: String,
      required: true,
      trim: true,
    },

    attendeeEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    ticketsBooked: {
      type: Number,
      default: 1,
      min: 1,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    checkInStatus: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Registration", RegistrationSchema);