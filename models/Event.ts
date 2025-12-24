import { Schema, model, models } from "mongoose";

const EventSchema = new Schema({
  eventId: { type: String, unique: true, sparse: true, index: true }, // Unique Event ID (e.g., EVT-00001) - optional for backward compatibility
  referenceId: { type: String, required: true, unique: true, index: true }, // Human-readable reference (KRMR-RSM-2026-PDL-RHL-EVT-00001)
  title: String,
  organiserName: String,
  organiserRole: String,
  institution: String,
  date: { type: Date, index: true },
  location: String,
  regionCode: { type: String, index: true },
  photos: { type: [String], default: [], validate: [arrayLimit, 'Photos exceeds the limit of 5'] },
  videos: { type: [String], default: [], validate: [arrayLimit, 'Videos exceeds the limit of 5'] }, // YouTube video IDs
  approved: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

function arrayLimit(val: string[]) {
  return val.length <= 5;
}

// Compound indexes for common query patterns
EventSchema.index({ approved: 1, date: -1 });
EventSchema.index({ regionCode: 1, date: -1 });
EventSchema.index({ createdAt: -1 });

export default models.Event || model("Event", EventSchema);








