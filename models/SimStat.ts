import { Schema, model, models } from "mongoose";

const SimStatSchema = new Schema({
  referenceId: { type: String, required: true, unique: true, index: true },
  sceneId: { type: String, required: true, index: true },
  category: {
    type: String,
    enum: ["bike", "car", "pedestrian", "other"],
    required: true,
    index: true,
  },
  success: { type: Boolean, required: true, index: true },
  attempts: { type: Number, required: true },
  seconds: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

// Compound indexes for common query patterns
SimStatSchema.index({ category: 1, success: 1 });
SimStatSchema.index({ sceneId: 1, success: 1 });
SimStatSchema.index({ success: 1, createdAt: -1 });

export default models.SimStat || model("SimStat", SimStatSchema);




