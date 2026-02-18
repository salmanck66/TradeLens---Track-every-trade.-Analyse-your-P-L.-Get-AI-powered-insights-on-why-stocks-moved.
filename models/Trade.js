import mongoose from "mongoose";

const TradeSchema = new mongoose.Schema({
  userId:  { type: String, required: true, index: true },
  date:    { type: String, required: true },
  symbol:  { type: String, required: true },
  qty:     { type: Number, required: true },
  entry:   { type: Number, required: true },
  sl:      { type: Number, default: null },
  tgt:     { type: Number, default: null },
  exit:    { type: Number, default: null },
  side:    { type: String, enum: ["LONG", "SHORT"], default: "LONG" },
  notes:   { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.Trade || mongoose.model("Trade", TradeSchema);
