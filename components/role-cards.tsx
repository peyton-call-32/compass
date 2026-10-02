"use client";

import {
  Boxes,
  Briefcase,
  Calculator,
  ChartBar,
  ChartLine,
  CodeXml,
  Handshake,
  HeartHandshake,
  Landmark,
  Megaphone,
  Palette,
  Rocket,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { ROLES } from "@/lib/vocab";

// Icon for each role in the shared vocabulary.
const ICONS: Record<string, LucideIcon> = {
  consulting: Briefcase,
  product: Boxes,
  finance: ChartLine,
  "investment-banking": Landmark,
  marketing: Megaphone,
  software: CodeXml,
  data: ChartBar,
  entrepreneurship: Rocket,
  accounting: Calculator,
  design: Palette,
  sales: Handshake,
  "social-impact": HeartHandshake,
  strategy: Workflow,
};

export function RoleCards({
  selected,
  onChange,
  max,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
  max: number; // 1 makes it single-select: picking another role replaces the first
}) {
  const full = max > 1 && selected.length >= max;
  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else if (max === 1) onChange([id]);
    else if (!full) onChange([...selected, id]);
  };
  return (
    <div className="role-grid">
      {Object.entries(ROLES).map(([id, name]) => {
        const Icon = ICONS[id] ?? Briefcase;
        const on = selected.includes(id);
        return (
          <button
            type="button"
            key={id}
            className={"role-card" + (on ? " on" : "") + (!on && full ? " dim" : "")}
            onClick={() => toggle(id)}
            aria-pressed={on}
          >
            <Icon size={16} strokeWidth={1.75} />
            {name}
          </button>
        );
      })}
    </div>
  );
}
