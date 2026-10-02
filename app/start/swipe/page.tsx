"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Undo2 } from "lucide-react";
import { BasicsFields, useSubmitProfile } from "@/components/form-bits";
import { RoleCards } from "@/components/role-cards";
import { ACTIVITIES, chosenInterests, suggestRoles, type Reaction } from "@/lib/explore";
import { label } from "@/lib/vocab";

type Step = "enjoy" | "paths" | "basics";
const STEPS: Step[] = ["enjoy", "paths", "basics"];
const THRESHOLD = 100;
const EYEBROW = {
  activity: "Would you enjoy",
  task: "Part of the job",
  role: "Could you see yourself as",
  world: "Would you want to work in",
};

export default function Explore() {
  const [step, setStep] = useState<Step>("enjoy");
  const [reactions, setReactions] = useState<{ id: string; r: Reaction }[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [experience, setExperience] = useState("");
  const { submit, saving, error } = useSubmitProfile();

  const byId = Object.fromEntries(reactions.map((x) => [x.id, x.r]));
  const interests = chosenInterests(byId);
  const suggestions = suggestRoles(byId);
  const top = suggestions.slice(0, 3);

  const toPaths = (all: typeof reactions) => {
    const top = suggestRoles(Object.fromEntries(all.map((x) => [x.id, x.r]))).slice(0, 3);
    // Start with the strong suggestions selected; weak ones are shown but left for the student to add.
    setChosen(top.filter((s) => s.score >= top[0].score / 2).map((s) => s.role));
    setShowAll(top.length === 0);
    setStep("paths");
  };

  return (
    <div className="wrap" style={{ maxWidth: step === "enjoy" ? 520 : 760 }}>
      <Progress current={STEPS.indexOf(step) + 1} />

      {step === "enjoy" && (
        <Enjoy
          reactions={reactions}
          onReact={(r) => {
            const next = [...reactions, { id: ACTIVITIES[reactions.length].id, r }];
            setReactions(next);
            if (next.length === ACTIVITIES.length) toPaths(next);
          }}
          onUndo={() => setReactions((x) => x.slice(0, -1))}
        />
      )}

      {step === "paths" && (
        <>
          <Back onClick={() => { setReactions((x) => x.slice(0, -1)); setStep("enjoy"); }} />
          <h1 style={{ margin: "0 0 10px" }}>{top.length ? "Paths that fit you" : "Pick a path to start"}</h1>
          <p className="lede" style={{ margin: "0 0 32px" }}>
            {top.length
              ? "Based on what you enjoy. Keep the ones that feel right, up to 3."
              : "Nothing stood out yet, so pick up to 3 to explore."}
          </p>
          {top.length > 0 && (
            <div className="paths">
              {top.map((s) => {
                const on = chosen.includes(s.role);
                return (
                  <button
                    key={s.role}
                    type="button"
                    className={"path" + (on ? " on" : "")}
                    aria-pressed={on}
                    onClick={() =>
                      setChosen(on ? chosen.filter((c) => c !== s.role) : chosen.length < 3 ? [...chosen, s.role] : chosen)
                    }
                  >
                    <span className="t">{label(s.role)}</span>
                    <span className="because">{s.because}</span>
                  </button>
                );
              })}
            </div>
          )}
          {showAll ? (
            <div style={{ marginTop: 20 }}>
              {top.length > 0 && <div className="eyebrow" style={{ marginBottom: 12 }}>All paths</div>}
              <RoleCards selected={chosen} onChange={setChosen} max={3} />
            </div>
          ) : (
            <button className="undo" style={{ marginTop: 4 }} onClick={() => setShowAll(true)}>
              Something else? See all paths
            </button>
          )}
          <button
            className="btn"
            style={{ marginTop: 32, display: "flex" }}
            disabled={chosen.length === 0}
            onClick={() => setStep("basics")}
          >
            Continue <ArrowRight size={15} />
          </button>
        </>
      )}

      {step === "basics" && (
        <>
          <Back onClick={() => setStep("paths")} />
          <h1 style={{ margin: "0 0 28px" }}>A few basics</h1>
          <div className="card">
            <BasicsFields {...{ major, setMajor, year, setYear, experience, setExperience }} />
            {error && <p className="error">{error}</p>}
            <button
              className="btn"
              disabled={!major || !year || saving}
              onClick={() => submit({ format: "swipe", major, year, targetRoles: chosen, interests, experience })}
            >
              {saving ? "Finding your matches..." : "See my matches"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Enjoy({
  reactions,
  onReact,
  onUndo,
}: {
  reactions: { id: string; r: Reaction }[];
  onReact: (r: Reaction) => void;
  onUndo: () => void;
}) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<number | null>(null);
  const index = reactions.length;
  const card = ACTIVITIES[index];

  const react = (r: Reaction) => {
    setDx(0);
    onReact(r);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") react("yes");
      if (e.key === "ArrowLeft") react("no");
      if (e.key === "ArrowUp") react("maybe");
      if (e.key === "z" && index > 0) onUndo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!card) return null;
  const yesOpacity = Math.max(0, Math.min(1, dx / THRESHOLD));
  const noOpacity = Math.max(0, Math.min(1, -dx / THRESHOLD));

  return (
    <>
      <div className="swipe-top">
        <div className="eyebrow">
          What do you enjoy? · {index + 1} of {ACTIVITIES.length}
        </div>
        <button className="undo" onClick={onUndo} disabled={index === 0}>
          <Undo2 size={14} /> Undo
        </button>
      </div>
      <div className="deck">
        <div
          key={card.id}
          className={"swipe-card" + (dragging ? " dragging" : "")}
          style={{ transform: `translateX(${dx}px) rotate(${dx / 20}deg)` }}
          onPointerDown={(e) => {
            start.current = e.clientX;
            setDragging(true);
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (start.current !== null) setDx(e.clientX - start.current);
          }}
          onPointerUp={() => {
            start.current = null;
            setDragging(false);
            if (dx > THRESHOLD) react("yes");
            else if (dx < -THRESHOLD) react("no");
            else setDx(0);
          }}
        >
          <span className="stamp yes" style={{ opacity: yesOpacity }}>
            THAT'S ME
          </span>
          <span className="stamp no" style={{ opacity: noOpacity }}>
            NOT ME
          </span>
          <div className="eyebrow">{EYEBROW[card.kind]}</div>
          <h2>{card.title}</h2>
          {card.detail && (
            <p className="muted" style={{ margin: 0 }}>
              {card.detail}
            </p>
          )}
        </div>
      </div>
      <div className="swipe-actions">
        <button className="btn no" onClick={() => react("no")}>
          Not me
        </button>
        <button className="btn no" onClick={() => react("maybe")}>
          Maybe
        </button>
        <button className="btn yes" onClick={() => react("yes")}>
          That's me
        </button>
      </div>
      <p className="hint" style={{ textAlign: "center", marginTop: 14 }}>
        Drag the card or tap a button. Keys: ← not me, ↑ maybe, → that's me, Z undo.
      </p>
    </>
  );
}

function Progress({ current }: { current: number }) {
  return (
    <div className="steps" aria-label={`Step ${current} of ${STEPS.length}`}>
      {STEPS.map((s, i) => (
        <span key={s} className={i < current ? "on" : ""} />
      ))}
      <em>
        Step {current} of {STEPS.length}
      </em>
    </div>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button className="undo" onClick={onClick} style={{ marginBottom: 12, marginLeft: -6 }}>
      <ArrowLeft size={14} /> Back
    </button>
  );
}
