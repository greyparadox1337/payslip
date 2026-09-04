import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { userId?: string }).userId; 
    if (!userId) {
       return NextResponse.json({ error: "User ID missing from session" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Find orgs where user is owner OR user is a member
    const { data: ownedOrgs } = await supabase
      .from('organisations')
      .select('*')
      .eq('owner_id', userId)
      .is('deleted_at', null);

    const { data: memberOrgs } = await supabase
      .from('organisation_members')
      .select('organisations(*)')
      .eq('user_id', userId);

    const orgsMap = new Map();
    if (ownedOrgs) {
      ownedOrgs.forEach(org => orgsMap.set(org.id, org));
    }
    if (memberOrgs) {
      memberOrgs.forEach(member => {
        const org = Array.isArray(member.organisations) ? member.organisations[0] : member.organisations;
        if (org && !org.deleted_at) {
          orgsMap.set(org.id, org);
        }
      });
    }

    const orgs = Array.from(orgsMap.values());

    return NextResponse.json(orgs);
  } catch (error) {
    console.error("GET /api/orgs error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { userId?: string }).userId; 
    if (!userId) {
       return NextResponse.json({ error: "User ID missing" }, { status: 400 });
    }

    const body = await req.json();
    const { name, industry } = body;

    if (!name) {
      return NextResponse.json({ error: "Organisation name is required" }, { status: 400 });
    }

    let slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const supabase = getServiceSupabase();

    const { data: existing } = await supabase
      .from('organisations')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const { data: newOrg, error: orgError } = await supabase
      .from('organisations')
      .insert({
        name,
        slug,
        industry,
        owner_id: userId,
      })
      .select()
      .single();

    if (orgError || !newOrg) {
      throw new Error("Failed to create organisation");
    }

    await supabase
      .from('organisation_members')
      .insert({
        org_id: newOrg.id,
        user_id: userId,
        role: "owner",
      });

    return NextResponse.json({ success: true, org: newOrg }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orgs error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
