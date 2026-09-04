import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServiceSupabase } from "@/lib/supabase";

/**
 * Give a new employer a workspace to land in.
 */
async function createDefaultOrganisation(userId: string, ownerName: string) {
  const orgName = `${ownerName}'s Organisation`;
  const supabase = getServiceSupabase();

  const base = orgName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  let slug = base;
  
  const { data: existingOrg } = await supabase
    .from('organisations')
    .select('slug')
    .eq('slug', slug)
    .single();

  if (existingOrg) {
    slug = `${base}-${Math.floor(Math.random() * 1000)}`;
  }

  // Create organisation
  const { data: org, error: orgError } = await supabase
    .from('organisations')
    .insert({
      name: orgName,
      slug,
      owner_id: userId,
    })
    .select('id')
    .single();

  if (orgError || !org) {
    throw new Error("Failed to create default organisation");
  }

  // Add member
  await supabase
    .from('organisation_members')
    .insert({
      org_id: org.id,
      user_id: userId,
      role: "owner"
    });

  return org;
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!['employer', 'employee'].includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role
      })
      .select('id')
      .single();

    if (userError || !newUser) {
      throw new Error("Failed to create user");
    }

    if (role === "employer") {
      await createDefaultOrganisation(newUser.id, name);
    }

    return NextResponse.json(
      { success: true, message: "Account created", userId: newUser.id },
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
