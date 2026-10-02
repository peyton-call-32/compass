import { ArrowRight, Briefcase, CalendarDays, UserRound, Users, type LucideIcon } from "lucide-react";
import type { Match, Opportunity } from "@/lib/types";
import { isThisWeek } from "@/lib/plan";
import { ActionButton } from "./action-button";

const TYPE_LABEL: Record<string, string> = {
  internship: "Internship",
  event: "Event",
  club: "Club",
  alum: "Alum to contact",
};

const TYPE_ICON: Record<string, LucideIcon> = {
  internship: Briefcase,
  event: CalendarDays,
  club: Users,
  alum: UserRound,
};

export function MatchCard({
  opp: o,
  reason,
  rank,
  profileId,
  saved,
  highlight,
  next,
}: {
  opp: Opportunity;
  reason?: string;
  rank?: number;
  profileId?: string; // When set, the action becomes a working save button
  saved?: boolean;
  highlight?: boolean;
  next?: boolean;
}) {
  const Icon = TYPE_ICON[o.type];
  return (
    <div className={`match ${o.type}` + (highlight ? " shared" : "") + (next ? " next" : "")}>
      <div className="rank">{rank ?? ""}</div>
      <div>
        <div className="type">
          <span className="dot" />
          {Icon && <Icon size={13} strokeWidth={2} />}
          {TYPE_LABEL[o.type]}
          {isThisWeek(o) && <span className="soon">This week</span>}
        </div>
        <div className="t">{o.title}</div>
        <div className="meta">
          {o.org}
          {o.when ? ` · ${o.when}` : ""}
        </div>
        <p className="desc">{o.description}</p>
        {reason && (
          <p className="reason">
            <strong>Why you:</strong> {reason}
          </p>
        )}
        {o.action &&
          (profileId ? (
            <ActionButton profileId={profileId} opportunityId={o.id} label={o.action} saved={!!saved} />
          ) : (
            <span className="action">
              {o.action} <ArrowRight size={13} />
            </span>
          ))}
      </div>
    </div>
  );
}

export function MatchList({
  matches,
  opportunities,
  highlight,
}: {
  matches: Match[];
  opportunities: Opportunity[];
  highlight?: Set<string>;
}) {
  const byId = new Map(opportunities.map((o) => [o.id, o]));
  return (
    <div>
      {matches.map((m, i) => {
        const o = byId.get(m.opportunityId);
        if (!o) return null;
        return <MatchCard key={o.id} opp={o} reason={m.reason} rank={i + 1} highlight={highlight?.has(o.id)} />;
      })}
    </div>
  );
}
