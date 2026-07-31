import { NextResponse } from "next/server";
import { isAddress, getAddress } from "viem";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import { Employee } from "@/lib/models/Employee";
import { checkOrgAccess } from "@/lib/checkOrgAccess";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

    const userId = (session.user as { userId?: string }).userId; if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const access = await checkOrgAccess(userId, orgId, "viewer");
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason }, { status: 403 });
    }

    const employees = await Employee.find({ orgId });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("GET /api/employees error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, walletAddress, salary, orgId } = body;

    if (!name || !walletAddress || !salary || !orgId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Payroll sends here later — a malformed address must not reach the database
    if (typeof walletAddress !== "string" || !isAddress(walletAddress)) {
      return NextResponse.json({ error: "Invalid EVM wallet address" }, { status: 400 });
    }

    const userId = (session.user as { userId?: string }).userId; if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const access = await checkOrgAccess(userId, orgId, "admin");
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason }, { status: 403 });
    }

    const newEmp = await Employee.create({
      name,
      walletAddress: getAddress(walletAddress),
      salary,
      orgId,
      status: "active"
    });

    return NextResponse.json({ success: true, employee: newEmp }, { status: 201 });
  } catch (error) {
    console.error("POST /api/employees error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
