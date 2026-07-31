import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import { Organisation } from "@/lib/models/Organisation";

/**
 * Give a new employer a workspace to land in. Mirrors POST /api/orgs, which is
 * still how anyone adds further organisations later.
 */
async function createDefaultOrganisation(userId: string, ownerName: string) {
  const orgName = `${ownerName}'s Organisation`;

  const base = orgName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  let slug = base;
  if (await Organisation.findOne({ slug })) {
    slug = `${base}-${Math.floor(Math.random() * 1000)}`;
  }

  return Organisation.create({
    name: orgName,
    slug,
    ownerId: userId,
    members: [{ userId, role: "owner", addedAt: new Date() }],
  });
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Role safety check
    if (!['employer', 'employee'].includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    // Basic password safety
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role
    });

    // Employers need an organisation to exist before the dashboard works at all:
    // employees, payroll, and the wallet link all hang off an orgId. Signing up
    // without one left the account in a dead state where every action failed.
    if (role === "employer") {
      await createDefaultOrganisation(newUser._id.toString(), name);
    }

    return NextResponse.json(
      { success: true, message: "Account created", userId: newUser._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}
