import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const OrganizerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Please provide full name"],
    trim: true,
  },
  orgName: {
    type: String,
    required: [true, "Please provide organization name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Please provide a phone number"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  address: {
    type: String,
    required: [true, "Please provide address"],
    trim: true,
  },
  city: {
    type: String,
    required: [true, "Please provide city"],
    trim: true,
  },
  state: {
    type: String,
    required: [true, "Please provide state"],
    trim: true,
  },
  country: {
    type: String,
    required: [true, "Please provide country"],
    trim: true,
  },
  pincode: {
    type: String,
    required: [true, "Please provide pincode"],
    trim: true,
  },
  idType: {
    type: String,
    required: [true, "Please provide verification ID type"],
    trim: true,
  },
  idNumber: {
    type: String,
    required: [true, "Please provide verification ID number"],
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to hash password
OrganizerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare candidate password
OrganizerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Organizer = mongoose.model("Organizer", OrganizerSchema);
export default Organizer;