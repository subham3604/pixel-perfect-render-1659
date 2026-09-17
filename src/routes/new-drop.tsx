import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, ShieldCheck, Download, AlertTriangle, MapPin, Briefcase } from "lucide-react";
import { TopNav } from "@/components/relay/TopNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { SAMPLE_JD } from "@/lib/relay-data";

export const Route = createFileRoute("/new-drop")({
  head: () => ({
    meta: [
      { title: "New Drop — Relay" },
      {
        name: "description",
        content:
          "Paste a raw job description, extract company, role and tech stack, and generate a resume snapshot grounded in your Master Vault.",
      },
      { property: "og:title", content: "New Drop — Relay" },
      {
        property: "og:description",
        content: "Manual ingestion and AI tailoring for job applications.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewDrop,
});

const TAILORED = `# Subham Ghosh
Backend Engineer · Bengaluru · subham@relay.dev

## Summary
Backend engineer with 3 years shipping high-throughput order and settlement
services. Tailored for **Backend Engineer - SDE II @ Swiggy**.

## Tech Stack
Python · Kafka · Redis · PostgreSQL · Docker · AWS

## Experience
**SDE-1, Payments Platform** (2023 — Present)
- [RAG] Cut p99 checkout latency 38% by reworking Redis cache keys and batching writes.
- [RAG] Built Kafka consumer group processing 4.2M settlement events/day with zero loss.
- Owned PostgreSQL partitioning migration across 900GB of ledger data.

## Projects
**Relay** — append-only event pipeline tracking applications from email.
**Kvstore** — Raft-backed key-value store in Go with snapshotting.

## Education
B.Tech, Computer Science — 2022
`;

function NewDrop() {
  const [jd, setJd] = useState("");
  const [parsed, setParsed] = useState(false);
  const [resume, setResume] = useState(TAILORED);
  const [edited, setEdited] = useState(false);

  return (
    <div className="min-h-screen">
      <TopNav />

      <main className="mx-auto grid max-w-[1600px] gap-4 px-4 py-5 sm:px-6 lg:grid-cols-2">
        {/* Left: JD drop */}
        <section className="panel flex flex-col p-4">
          <header className="flex items-center gap-2">
            <h1 className="text-sm font-semibold">Job Description Drop</h1>
            <Badge variant="muted" className="ml-auto px-1.5 py-0 text-[10px]">
              Manual Ingestion
            </Badge>
          </header>

          <Textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste raw job description text from LinkedIn, Naukri, or career portal..."
            className="mt-3 min-h-64 resize-none bg-background font-mono text-xs leading-relaxed"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              variant="ai"
              onClick={() => {
                if (!jd.trim()) setJd(SAMPLE_JD);
                setParsed(true);
                setEdited(false);
                toast.success("Parsed JD and grounded a tailored snapshot");
              }}
            >
              <Sparkles /> Parse &amp; Tailor Resume
            </Button>
            <span className="text-[11px] text-muted-foreground">
              {jd.trim().length} chars staged
            </span>
          </div>

          <div className="mt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Extracted Metadata
            </h2>
            {parsed ? (
              <div className="mt-2 rounded-lg border border-border bg-background p-3">
                <div className="flex items-start gap-2.5">
                  <span className="grid size-8 place-items-center rounded-md border border-border bg-elevated text-xs font-semibold">
                    S
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Swiggy</p>
                    <p className="text-xs text-muted-foreground">Backend Engineer - SDE II</p>
                  </div>
                  <Badge variant="info" className="ml-auto px-1.5 py-0 text-[10px]">
                    Naukri
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="muted" className="gap-1 px-1.5 py-0 text-[10px]">
                    <MapPin className="size-3" /> Bengaluru
                  </Badge>
                  <Badge variant="muted" className="gap-1 px-1.5 py-0 text-[10px]">
                    <Briefcase className="size-3" /> 2-4 yrs
                  </Badge>
                </div>
                <div className="mt-3">
                  <p className="mb-1.5 text-[11px] text-muted-foreground">Detected Tech Stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Python", "Kafka", "Redis", "PostgreSQL"].map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-ai/40 bg-ai/10 px-2 py-0.5 font-mono text-[10px] text-ai"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-2 rounded-lg border border-dashed border-border px-3 py-6 text-center text-[11px] text-muted-foreground">
                Metadata populates after extraction.
              </p>
            )}
          </div>
        </section>

        {/* Right: resume snapshot */}
        <section className="panel flex flex-col p-4">
          <header className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold">Grounded Resume Snapshot</h2>
            <Badge variant="success" className="gap-1 px-1.5 py-0 text-[10px]">
              <ShieldCheck className="size-3" /> Grounded in Master Vault (100% Verified)
            </Badge>
            <Button
              size="sm"
              variant="subtle"
              className="ml-auto"
              onClick={() => toast.success("Markdown exported")}
            >
              <Download /> Export Markdown
            </Button>
          </header>

          {edited && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-[11px] text-warning">
              <AlertTriangle className="size-3.5" />
              Manually edited from AI-generated snapshot
            </div>
          )}

          <Textarea
            value={resume}
            onChange={(e) => {
              setResume(e.target.value);
              setEdited(true);
            }}
            className="mt-3 min-h-[26rem] flex-1 resize-none bg-background font-mono text-xs leading-relaxed scroll-thin"
          />

          <div className="sticky bottom-0 mt-3 bg-surface pt-1">
            <Button
              className="w-full"
              onClick={() => toast.success("Saved to pipeline — stage: Applied")}
            >
              Confirm &amp; Save to Pipeline
            </Button>
          </div>
        </section>
      </main>

      <Toaster />
    </div>
  );
}
