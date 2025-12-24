import { Schema, model, models } from "mongoose";

const PageCompletionSchema = new Schema({
  referenceId: { type: String, required: true, unique: true, index: true },
  pageType: {
    type: String,
    enum: ["basics", "guides", "prevention"],
    required: true,
    index: true,
  },
  completed: { type: Boolean, default: true, index: true },
  completedAt: { type: Date, default: Date.now, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

// Compound indexes for common query patterns
PageCompletionSchema.index({ pageType: 1, completed: 1 });
PageCompletionSchema.index({ pageType: 1, createdAt: -1 });

export default models.PageCompletion || model("PageCompletion", PageCompletionSchema);

