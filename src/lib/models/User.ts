import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: "employer" | "employee";
  linkedWallet?: string;
  joinToken?: string;
  avatarColor: string;
  createdAt: Date;
  lastLogin?: Date;
  rememberMe: boolean;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  preferences: {
    emailOnPayroll: boolean;
    emailOnSalary: boolean;
    securityAlerts: boolean;
  };
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: false },
  role: { type: String, enum: ["employer", "employee"], required: true },
  linkedWallet: { type: String }, // Optional Robinhood Chain Address string
  joinToken: { type: String, unique: true, sparse: true },
  avatarColor: { type: String, default: "#6366f1" },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  rememberMe: { type: Boolean, default: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date },
  preferences: {
    emailOnPayroll: { type: Boolean, default: true },
    emailOnSalary: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
  },
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
