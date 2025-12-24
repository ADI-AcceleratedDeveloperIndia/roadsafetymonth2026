import { Schema, model, models } from "mongoose";

const OrganiserSchema = new Schema({
  tempOrganiserId: { type: String, unique: true, index: true }, // Temporary ID given on registration
  finalOrganiserId: { type: String, unique: true, sparse: true, index: true }, // Permanent ID given on approval
  // Note: Events get their own IDs when created, not when organiser is approved
  name: { type: String, required: true },
  organisation: { type: String, required: true },
  mobileNumber: { type: String, required: true, index: true },
  eventLocation: { type: String, required: true, default: "Karimnagar", index: true },
  proposedEventDate: { type: Date, required: true, index: true },
  eventType: { 
    type: String, 
    enum: ["School", "College", "Public Awareness"],
    required: true,
    index: true,
  },
  status: { 
    type: String, 
    enum: ["Pending Approval", "Approved", "Rejected"],
    default: "Pending Approval",
    index: true,
  },
  createdAt: { type: Date, default: Date.now, index: true },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  approvedBy: { type: String }, // Admin email or ID
});

// Compound indexes for common query patterns
OrganiserSchema.index({ status: 1, createdAt: -1 });
OrganiserSchema.index({ eventLocation: 1, status: 1 });
OrganiserSchema.index({ eventType: 1, status: 1 });

export default models.Organiser || model("Organiser", OrganiserSchema);

