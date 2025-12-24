import { Schema, model, models } from "mongoose";

const CertificateSchema = new Schema({
  certificateId: { type: String, index: true, unique: true },
  type: {
    type: String,
    enum: ["organiser", "participant", "merit"],
    required: true,
    index: true,
  },
  fullName: { type: String, required: true },
  institution: String,
  eventTitle: String,
  eventDate: Date,
  regionCode: { type: String, index: true },
  score: Number,
  createdAt: { type: Date, default: Date.now, index: true },
  verificationUrl: String,
  appreciationOptIn: { type: Boolean, default: false, index: true },
  appreciationText: String,
  appreciationTo: {
    type: String,
    default: "To Sri Ponnam Prabhakar Garu, Hon'ble Cabinet Minister of Government of Telangana",
  },
  userEmail: String,
  userIpHash: String,
});

// Compound indexes for common query patterns
CertificateSchema.index({ appreciationOptIn: 1, createdAt: -1 });
CertificateSchema.index({ regionCode: 1, createdAt: -1 });
CertificateSchema.index({ type: 1, createdAt: -1 });

export default models.Certificate || model("Certificate", CertificateSchema);










