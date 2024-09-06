const mongoose = require("mongoose");

const withdrawalIntentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    amount: { type: Number, default: 0 },
    bankName: { type: String, default: "" },
    bankAccount: { type: String, default: "" },
    bankCustomerName: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String }, // Optional field for rejected intents
  },
  { timestamps: true }
); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model("withdrawalintent", withdrawalIntentSchema);
