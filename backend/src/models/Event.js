import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: [
      "Technology",
      "Workshop",
      "Sports",
      "Cultural",
      "Business",
      "Music",
      "Other"
    ],
    required: true
  },
  date: {
    type: Date,
    required: true,
  },
  venue: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalTickets: {
    type: Number,
    required: true,
    min: 0
  },
  availableTickets: {
    type: Number,
    default: 0,
    min: 0
  },
  organizer: {
    name: String
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  image: {
    type: String,
    default: ""
  }
},
  { timestamps: true }
);

const Event = mongoose.model("Event", EventSchema);

export default Event;