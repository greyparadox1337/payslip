import mongoose, { Schema, Document } from "mongoose";

export interface IOrganisation extends Document {
  name: string;
  slug: string;
  industry?: string;
  walletAddress?: string;
  ownerId: mongoose.Types.ObjectId;
  members: {
    userId: mongoose.Types.ObjectId;
    role: "owner" | "admin" | "viewer";
    addedAt: Date;
  }[];
  createdAt: Date;
  settings: {
    currency: string;
    paySchedule: "weekly" | "biweekly" | "monthly";
  };
  deletedAt?: Date;
}

const OrganisationSchema = new Schema<IOrganisation>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  industry: { type: String },
  walletAddress: { type: String },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["owner", "admin", "viewer"] },
      addedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  settings: {
    currency: { type: String, default: "ETH" },
    paySchedule: {
      type: String,
      enum: ["weekly", "biweekly", "monthly"],
      default: "monthly",
    },
  },
  deletedAt: { type: Date },
});

export const Organisation =
  mongoose.models.Organisation ||
  mongoose.model<IOrganisation>("Organisation", OrganisationSchema);
