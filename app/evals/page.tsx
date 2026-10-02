import { MatchList } from "@/components/match-list";
import { getEvalProfiles, getOpportunities } from "@/lib/data";
import { findMatches } from "@/lib/match";

export const dynamic = "force-dynamic";

// Sprint 1 test: two students with different majors should share no more than 3 top matches.
export default async function EvalsPage() {
  const [profiles, opportunities] = await Promise.all([getEvalProfiles(), getOpportunities()]);
  const results = await Promise.all(profiles.map((p) => findMatches(p, opportunities)));

  const [a, b] = results;
  const shared = new Set(
    a && b
      ? a.matches.map((m) => m.opportunityId).filter((id) => b.matches.some((n) => n.opportunityId === id))
      : []
  );
  const pass = shared.size <= 3;

  return (
    <div className="wrap" style={{ maxWidth: 1100 }}>
      <div className="eyebrow">Match test</div>
      <h1 style={{ margin: "8px 0 10px" }}>Two students, different majors</h1>
      <p className="muted">Goal: they share no more than 3 of their top matches. Shared matches are outlined.</p>
      <p className={"result " + (pass ? "pass" : "fail")}>
        {pass ? "Pass" : "Fail"}: {shared.size} shared match{shared.size === 1 ? "" : "es"} · method:{" "}
        {a?.method ?? "none"}
      </p>
      <div className="cols">
        {profiles.map((p, i) => (
          <div key={p.id}>
            <h3 style={{ marginBottom: 6 }}>
              Student {String.fromCharCode(65 + i)}: {p.major}
            </h3>
            <p className="muted" style={{ marginTop: 0 }}>
              {p.summary}
            </p>
            <MatchList matches={results[i].matches} opportunities={opportunities} highlight={shared} />
          </div>
        ))}
      </div>
    </div>
  );
}
