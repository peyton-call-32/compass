import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { SCHOOL } from "@/lib/school";
import "./globals.css";

// Editorial serif for headings, clean sans for everything else.
const serif = Newsreader({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: SCHOOL.hubName,
  description: `Get to know a ${SCHOOL.name} student, then show ranked opportunities with a reason for each.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable}`}
      style={{ "--accent": SCHOOL.accent } as React.CSSProperties}
    >
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
