import { Schema, model, models } from "mongoose";

const SimulationPlaySchema = new Schema({
  type: { type: String, enum: ["bike", "car", "pedestrian"], required: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

// Compound index for counting by type
SimulationPlaySchema.index({ type: 1, createdAt: -1 });

export default models.SimulationPlay || model("SimulationPlay", SimulationPlaySchema);









