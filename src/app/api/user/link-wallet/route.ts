import { NextResponse } from "next/server";
import { isAddress, getAddress } from "viem";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import { Organisation } from "@/lib/models/Organisation";
import { checkOrgAccess } from "@/lib/checkOrgAccess";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await connectDB();
    const userId = (session.user as { userId?: string }).userId;
    if (!userId) {
      return NextResponse.json({ error: "User ID missing from session" }, { status: 400 });
    }
    
    const body = await req.json();
    const { walletAddress, orgId } = body;
    
    if (!walletAddress || typeof walletAddress !== "string" || !isAddress(walletAddress)) {
      return NextResponse.json({ error: "Invalid EVM wallet address" }, { status: 400 });
    }

    // Store checksummed so comparisons elsewhere have one canonical form
    const address = getAddress(walletAddress);

    // Globally link to the specific User instance safely
    await User.findByIdAndUpdate(userId, { linkedWallet: address });

    // Ensure the Organisation bounds matches the explicitly executing user natively
    if (orgId) {
      const access = await checkOrgAccess(userId, orgId, "admin");
      if (access.allowed) {
        await Organisation.findByIdAndUpdate(orgId, { walletAddress: address });
      }
    }

    return NextResponse.json({ success: true, linkedWallet: address });
  } catch (error) {
    console.error("PATCH /api/user/link-wallet error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
