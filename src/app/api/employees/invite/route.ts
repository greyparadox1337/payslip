import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import { Employee } from "@/lib/models/Employee";
import { User } from "@/lib/models/User";
import { checkOrgAccess } from "@/lib/checkOrgAccess";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { isAddress, getAddress } from "viem";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, walletAddress, email, salary, orgId } = await req.json();

    if (!name || !walletAddress || !email || !salary || !orgId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Payroll sends here later — a malformed address must not reach the database
    if (typeof walletAddress !== "string" || !isAddress(walletAddress)) {
      return NextResponse.json({ error: "Invalid EVM wallet address" }, { status: 400 });
    }
    const address = getAddress(walletAddress);

    const userId = (session.user as { userId?: string }).userId; if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const access = await checkOrgAccess(userId, orgId, "admin");
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason }, { status: 403 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // 1. Create the Pre-Invite Employee Native User Profile
    const token = crypto.randomBytes(32).toString('hex');
    await User.create({
      name,
      email: email.toLowerCase(),
      role: "employee",
      linkedWallet: address,
      avatarColor: "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      joinToken: token
    });

    // 2. Track Employee globally in the specific Organisation scope
    const newEmp = await Employee.create({
      name,
      walletAddress: address,
      salary,
      orgId,
      status: "pending"
    });

    // Emulating an outbound SMTP sequence natively onto standard out terminal limits
    console.log(`\n======================================\nEmployee Account Pre-Link URL for ${name}:\nhttp://localhost:3000/join/${token}\n======================================\n`);

    return NextResponse.json({ success: true, employee: newEmp }, { status: 201 });
  } catch (error) {
    console.error("POST /api/employees/invite error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
