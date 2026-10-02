"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProfileInput } from "@/lib/types";
import { MAJORS, YEARS } from "@/lib/vocab";
import { rememberProfile } from "./app-shell";

export function Chips({
  options,
  selected,
  onChange,
  max,
}: {
  options: Record<string, string>;
  selected: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else if (!max || selected.length < max) onChange([...selected, id]);
  };
  return (
    <div className="chips">
      {Object.entries(options).map(([id, name]) => (
        <button
          type="button"
          key={id}
          className={"chip" + (selected.includes(id) ? " on" : "")}
          onClick={() => toggle(id)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

export function BasicsFields({
  major,
  setMajor,
  year,
  setYear,
  experience,
  setExperience,
}: {
  major: string;
  setMajor: (v: string) => void;
  year: string;
  setYear: (v: string) => void;
  experience: string;
  setExperience: (v: string) => void;
}) {
  // "Other" shows a text box, and whatever they type is saved as the major.
  const [otherMajor, setOtherMajor] = useState(major !== "" && !MAJORS.includes(major));
  return (
    <>
      <div className="field">
        <label htmlFor="major">What's your major?</label>
        <select
          id="major"
          value={otherMajor ? "Other" : major}
          onChange={(e) => {
            const isOther = e.target.value === "Other";
            setOtherMajor(isOther);
            setMajor(isOther ? "" : e.target.value);
          }}
        >
          <option value="">Pick one</option>
          {MAJORS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        {otherMajor && (
          <input
            type="text"
            aria-label="Your major"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            placeholder="Type your major"
            maxLength={80}
            autoFocus
            style={{ marginTop: 8 }}
          />
        )}
      </div>
      <div className="field">
        <div className="q">What year are you?</div>
        <div className="chips">
          {YEARS.map((y) => (
            <button
              type="button"
              key={y}
              className={"chip" + (year === y ? " on" : "")}
              onClick={() => setYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="exp">
          Any experience worth knowing? <span className="hint">Jobs, clubs, projects. Optional.</span>
        </label>
        <textarea
          id="exp"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="Part-time job, club officer role, a class project..."
        />
      </div>
    </>
  );
}

// Saves the profile, then sends the student to their matches.
export function useSubmitProfile() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (input: ProfileInput) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Could not save your profile");
      const { id } = await res.json();
      rememberProfile(id);
      router.push(`/matches/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSaving(false);
    }
  };
  return { submit, saving, error };
}
