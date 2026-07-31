import { NextResponse } from "next/server";
import { isAddress, getAddress } from "viem";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // Explicit server-side payload boundary matching user explicitly 
    const userId = (session.user as { id?: string; userId?: string }).id || (session.user as { id?: string; userId?: string }).userId;
    await connectDB();

    const user = await User.findById(userId).select("name email linkedWallet avatarColor role");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET api/employee/profile error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as { id?: string; userId?: string }).id || (session.user as { id?: string; userId?: string }).userId;
    const body = await req.json();
    
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Patch valid fields
    if (body.name) user.name = body.name;
    if (body.avatarColor) user.avatarColor = body.avatarColor;
    if (body.linkedWallet) {
      if (!isAddress(body.linkedWallet)) {
        return NextResponse.json({ error: "Invalid EVM wallet address" }, { status: 400 });
      }
      // Checksummed, so every stored address has one canonical form
      user.linkedWallet = getAddress(body.linkedWallet);
    }

    await user.save();
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("PATCH api/employee/profile error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
