"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BasicsFields, useSubmitProfile } from "@/components/form-bits";
import { RoleCards } from "@/components/role-cards";

// Shared flow for the two home options that start from roles. Screen 1 asks only for roles;
// screen 2 asks for the basics matching needs. Both save the same profile shape.
const MODES = {
  target: {
    eyebrow: "I know my target role",
    title: "What's your target role?",
    hint: "Pick one. We'll build your plan around it.",
    minRoles: 1,
    maxRoles: 1,
  },
  compare: {
    eyebrow: "I'm weighing a few paths",
    title: "Which paths are you weighing?",
    hint: "Pick 2 or 3. We'll help you test each one.",
    minRoles: 2,
    maxRoles: 3,
  },
};

export function RoleQuestions({ mode }: { mode: keyof typeof MODES }) {
  const copy = MODES[mode];
  const [step, setStep] = useState<"roles" | "basics">("roles");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [experience, setExperience] = useState("");
  const { submit, saving, error } = useSubmitProfile();

  if (step === "roles") {
    return (
      <div className="wrap" style={{ maxWidth: 820 }}>
        <Steps current={1} />
        <h1 style={{ margin: "0 0 10px" }}>{copy.title}</h1>
        <p className="lede" style={{ margin: "0 0 36px" }}>
          {copy.hint}
        </p>
        <RoleCards selected={targetRoles} onChange={setTargetRoles} max={copy.maxRoles} />
        <button
          className="btn"
          style={{ marginTop: 36 }}
          disabled={targetRoles.length < copy.minRoles}
          onClick={() => setStep("basics")}
        >
          Continue <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="wrap">
      <Steps current={2} />
      <button className="undo" onClick={() => setStep("roles")} style={{ marginBottom: 12, marginLeft: -6 }}>
        <ArrowLeft size={14} /> Back
      </button>
      <h1 style={{ margin: "0 0 28px" }}>A few basics</h1>
      <div className="card">
        <BasicsFields {...{ major, setMajor, year, setYear, experience, setExperience }} />
        {error && <p className="error">{error}</p>}
        <button
          className="btn"
          disabled={!major || !year || saving}
          onClick={() => submit({ format: "quick", major, year, targetRoles, interests: [], experience })}
        >
          {saving ? "Finding your matches..." : "See my matches"}
        </button>
      </div>
    </div>
  );
}

function Steps({ current }: { current: 1 | 2 }) {
  return (
    <div className="steps" aria-label={`Step ${current} of 2`}>
      <span className={current >= 1 ? "on" : ""} />
      <span className={current >= 2 ? "on" : ""} />
      <em>Step {current} of 2</em>
    </div>
  );
}
