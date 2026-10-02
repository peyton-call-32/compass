import Link from "next/link";
import { ArrowRight, FileText, GraduationCap, Heart, RotateCcw, Sparkles, Target } from "lucide-react";
import { notFound } from "next/navigation";
import { MatchCard } from "@/components/match-list";
import { getOpportunities, getPlan, getProfile, getSavedMatches, saveMatches } from "@/lib/data";
import { findMatches } from "@/lib/match";
import { groupPlan, type PlanEntry } from "@/lib/plan";
import { label } from "@/lib/vocab";

export const dynamic = "force-dynamic";

export default async function MatchesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile(id);
  if (!profile) notFound();

  const opportunities = await getOpportunities();
  // Matches are saved after the first run so a refresh doesn't call Claude again.
  let result = await getSavedMatches(profile.id);
  if (!result) {
    result = await findMatches(profile, opportunities);
    await saveMatches(result);
  }

  const plan = await getPlan(profile.id);
  const saved = new Set(plan.map((i) => i.opportunityId));
  const groups = groupPlan(result.matches, opportunities);

  const card = (e: PlanEntry, next = false) => (
    <MatchCard
      key={e.opp.id}
      opp={e.opp}
      reason={e.match.reason}
      rank={e.rank}
      profileId={profile.id}
      saved={saved.has(e.opp.id)}
      next={next}
    />
  );
  const sections: { title: string; hint: string; entries: PlanEntry[] }[] = [
    { title: "Do this week", hint: "Events and deadlines, soonest first", entries: groups.doThisWeek },
    { title: "People to talk to", hint: "Alumni open to a coffee chat", entries: groups.people },
    { title: "Clubs to join", hint: "Build skills and meet people on the same path", entries: groups.clubs },
  ];

  return (
    <div className="layout">
      <main className="matches">
        <div className="eyebrow">Your plan</div>
        <h1 style={{ margin: "6px 0 10px" }}>Here's where to start</h1>
        <p className="muted" style={{ margin: "0 0 32px" }}>
          {result.matches.length} matches picked for you, grouped by what to do next.
        </p>
        {groups.next && (
          <section className="plan-section">
            <h2>Your next step</h2>
            {card(groups.next, true)}
          </section>
        )}
        {sections.map(
          (s) =>
            s.entries.length > 0 && (
              <section className="plan-section" key={s.title}>
                <h2>{s.title}</h2>
                <p className="hint">{s.hint}</p>
                {s.entries.map((e) => card(e))}
              </section>
            )
        )}
        <Link className="btn ghost" href={`/matches/${profile.id}/plan`}>
          My plan{saved.size ? ` (${saved.size} saved)` : ""} <ArrowRight size={15} />
        </Link>
      </main>
      <aside className="profile">
        <h2>
          <GraduationCap size={16} /> Your profile
        </h2>
        <p>
          {profile.year} · {profile.major}
        </p>
        {profile.targetRoles.length > 0 && (
          <>
            <h3>
              <Target size={12} /> Roles
            </h3>
            <div className="chips">
              {profile.targetRoles.map((t) => (
                <span key={t}>{label(t)}</span>
              ))}
            </div>
          </>
        )}
        {profile.interests.length > 0 && (
          <>
            <h3>
              <Heart size={12} /> Interests
            </h3>
            <div className="chips">
              {profile.interests.map((t) => (
                <span key={t}>{label(t)}</span>
              ))}
            </div>
          </>
        )}
        {profile.experience && (
          <>
            <h3>
              <FileText size={12} /> Experience
            </h3>
            <p>{profile.experience}</p>
          </>
        )}
        <h3>
          <Sparkles size={12} /> Summary
        </h3>
        <p>{profile.summary}</p>
        <Link className="restart" href="/">
          <RotateCcw size={14} /> Start over
        </Link>
      </aside>
    </div>
  );
}
