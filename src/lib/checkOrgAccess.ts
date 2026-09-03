import { getServiceSupabase } from "./supabase";

export async function checkOrgAccess(
  userId: string,
  orgId: string,
  required: "viewer" | "admin" | "owner"
): Promise<{ allowed: boolean; reason?: string; userRole?: string }> {
  try {
    const supabase = getServiceSupabase();
    
    const { data: org, error } = await supabase
      .from('organisations')
      .select('*')
      .eq('id', orgId)
      .is('deleted_at', null)
      .single();

    if (error || !org) {
      return { allowed: false, reason: "not found" };
    }

    if (org.owner_id === userId) {
      return { allowed: true, userRole: "owner" };
    }

    const { data: member } = await supabase
      .from('organisation_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .single();

    if (!member) {
      return { allowed: false, reason: "not a member" };
    }

    const levels: Record<"viewer" | "admin" | "owner", number> = {
      viewer: 0,
      admin: 1,
      owner: 2,
    };

    const role = member.role ?? "viewer";
    if (levels[role as keyof typeof levels] >= levels[required]) {
      return { allowed: true, userRole: role };
    }

    return { allowed: false, reason: "insufficient role" };
  } catch {
    return { allowed: false, reason: "server error" };
  }
}
