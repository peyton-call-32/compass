import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MatchCard } from "@/components/match-list";
import { getOpportunities, getPlan, getProfile, getSavedMatches } from "@/lib/data";

export const dynamic = "force-dynamic";

// What the student saved from their matches, oldest first, like a to-do list.
export default async function MyPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile(id);
  if (!profile) notFound();

  const [plan, opportunities, result] = await Promise.all([
    getPlan(profile.id),
    getOpportunities(),
    getSavedMatches(profile.id),
  ]);
  const byId = new Map(opportunities.map((o) => [o.id, o]));
  const reasons = new Map((result?.matches ?? []).map((m) => [m.opportunityId, m.reason]));
  const items = plan.flatMap((i) => {
    const opp = byId.get(i.opportunityId);
    return opp ? [opp] : [];
  });

  return (
    <div className="wrap">
      <div className="eyebrow">My plan</div>
      <h1 style={{ margin: "8px 0 10px" }}>Your saved next steps</h1>
      <p className="muted" style={{ margin: "0 0 32px" }}>
        Saving doesn't send anything. Use this as your to-do list, and tap an item again to remove it.
      </p>
      {items.length ? (
        items.map((o) => (
          <MatchCard key={o.id} opp={o} reason={reasons.get(o.id)} profileId={profile.id} saved />
        ))
      ) : (
        <div className="card empty">
          <p style={{ margin: "0 0 16px" }}>
            Nothing saved yet. On your matches, tap Apply, RSVP, Join, or Request coffee chat to add it here.
          </p>
        </div>
      )}
      <Link className="btn ghost" href={`/matches/${profile.id}`} style={{ marginTop: 16 }}>
        <ArrowLeft size={15} /> Back to matches
      </Link>
    </div>
  );
}
