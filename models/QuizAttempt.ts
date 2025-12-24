import { Schema, model, models } from "mongoose";

const QuizAttemptSchema = new Schema({
  referenceId: { type: String, required: true, unique: true, index: true },
  certificateType: {
    type: String,
    enum: ["QUIZ", "PAR"],
    required: true,
    index: true,
  },
  fullName: String,
  institution: String,
  score: Number,
  passed: { type: Boolean, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

// Compound indexes for common query patterns
QuizAttemptSchema.index({ passed: 1, createdAt: -1 });
QuizAttemptSchema.index({ certificateType: 1, createdAt: -1 });

export default models.QuizAttempt || model("QuizAttempt", QuizAttemptSchema);








