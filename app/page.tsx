import Link from "next/link";
import { ArrowRight, Compass, Split, Target } from "lucide-react";
import { SCHOOL } from "@/lib/school";

export default function Home() {
  return (
    <div className="wrap" style={{ maxWidth: 960 }}>
      <h1 className="display" style={{ margin: "0 0 16px" }}>Welcome to {SCHOOL.hubName}</h1>
      <p className="lede" style={{ margin: 0 }}>
        Tell us where you are. We'll show you what to do next.
      </p>

      <div className="choices">
        <Link className="choice" href="/start/quick">
          <div className="icon">
            <Target size={18} />
          </div>
          <h3>I know my target role</h3>
          <p className="muted" style={{ margin: 0 }}>
            Tell us the role you want. We'll show you how to get there.
          </p>
          <span className="go">
            Get started <ArrowRight size={14} />
          </span>
        </Link>
        <Link className="choice" href="/start/compare">
          <div className="icon">
            <Split size={18} />
          </div>
          <h3>I'm weighing a few paths</h3>
          <p className="muted" style={{ margin: 0 }}>
            Pick the ones you're considering. We'll help you try each one.
          </p>
          <span className="go">
            Get started <ArrowRight size={14} />
          </span>
        </Link>
        <Link className="choice" href="/start/swipe">
          <div className="icon">
            <Compass size={18} />
          </div>
          <h3>I'm still exploring</h3>
          <p className="muted" style={{ margin: 0 }}>
            Swipe through careers to find a place to start.
          </p>
          <span className="go">
            Get started <ArrowRight size={14} />
          </span>
        </Link>
      </div>

      <p className="hint" style={{ marginTop: 40 }}>
        Opportunity data is a hand-built sample. <Link href="/evals">Run the two-student test</Link>
      </p>
    </div>
  );
}
