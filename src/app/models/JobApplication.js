import { Schema, model, models } from "mongoose";

const jobApplicationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"],
    },
    position: {
      type: String,
      required: [true, "Job position is required"],
      enum: [
        "Chef",
        "Semi Comi (Helper)",
        "House Keeping",
        "Manager", 
        "Sales Person",
        "Marketing Executive"
      ],
    },
    experience: {
      type: String,
      required: [true, "Experience is required"],
      enum: [
        "0-1 years",
        "1-3 years", 
        "3-5 years",
        "5-10 years",
        "10+ years"
      ],
    },
    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      trim: true,
      maxlength: [200, "Qualification cannot exceed 200 characters"],
    },
    currentLocation: {
      type: String,
      required: [true, "Current location is required"],
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    expectedSalary: {
      type: String,
      required: [true, "Expected salary is required"],
      trim: true,
    },
    noticePeriod: {
      type: String,
      required: [true, "Notice period is required"],
      enum: [
        "Immediate",
        "15 days",
        "1 month",
        "2 months",
        "3 months",
        "More than 3 months"
      ],
    },
    resumeUrl: {
      type: String,
      required: [true, "Resume is required"],
      trim: true,
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: [1000, "Cover letter cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"],
      default: "Applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    }
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
jobApplicationSchema.index({ email: 1 });
jobApplicationSchema.index({ position: 1 });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ appliedAt: -1 });

const JobApplication = models.JobApplication || model("JobApplication", jobApplicationSchema);

export default JobApplication;
