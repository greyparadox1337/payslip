import { NextResponse } from "next/server";
import { isAddress } from "viem";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { walletAddress } = await req.json();
    if (!walletAddress || typeof walletAddress !== "string" || !isAddress(walletAddress)) {
      return NextResponse.json({ error: "Invalid EVM wallet address" }, { status: 400 });
    }

    await connectDB();
    // Match case-insensitively — EVM addresses are, and rows written before
    // checksumming was enforced can be in any casing. Safe to interpolate:
    // isAddress already proved this is 0x plus 40 hex characters.
    const user = await User.findOne({
      linkedWallet: new RegExp(`^${walletAddress}$`, "i"),
      role: "employee",
    });
    if (!user) {
      return NextResponse.json({ error: "No employee account linked to this wallet. Please sign up first." }, { status: 404 });
    }

    // Explicitly generate a temporary token specifically evaluating immediate injection
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) throw new Error("NEXTAUTH_SECRET not configured");
    const walletToken = jwt.sign({ userId: user._id.toString() }, secret, { expiresIn: '5m' });

    return NextResponse.json({ email: user.email, token: walletToken });
  } catch (error: any) {
    console.error("Wallet login check failed:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
