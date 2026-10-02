import { NextResponse } from "next/server";
import { getOpportunities, getProfile, setPlanItem } from "@/lib/data";

// Saves or removes a plan item. This only records it locally; nothing is sent anywhere.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const profileId = typeof body?.profileId === "string" ? body.profileId : "";
  const opportunityId = typeof body?.opportunityId === "string" ? body.opportunityId : "";
  if (!profileId || !opportunityId) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const [profile, opportunities] = await Promise.all([getProfile(profileId), getOpportunities()]);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (!opportunities.some((o) => o.id === opportunityId)) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  const items = await setPlanItem(profileId, opportunityId, body.saved !== false);
  return NextResponse.json({ items });
}
