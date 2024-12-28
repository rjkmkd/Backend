import mongoose from "mongoose"

const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: Schema.Types.objectId, //one who is subscribing
      ref: "User",
    },
    channel: {
      type: Schema.Types.objectId, //one to whome subscribers subscribing
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);