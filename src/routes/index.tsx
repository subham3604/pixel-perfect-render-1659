import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { TopNav } from "@/components/relay/TopNav";
import { AttentionBanner } from "@/components/relay/AttentionBanner";
import { AppCard } from "@/components/relay/AppCard";
import { DetailDrawer } from "@/components/relay/DetailDrawer";
import { Toaster } from "@/components/ui/sonner";
import { APPLICATIONS, STAGES, type Application } from "@/lib/relay-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Relay — Pipeline Dashboard" },
      {
        name: "description",
        content:
          "Relay is an AI-powered autonomous job application tracker: a Kanban pipeline fed by a daily Gmail worker and grounded resume snapshots.",
      },
      { property: "og:title", content: "Relay — Pipeline Dashboard" },
      {
        property: "og:description",
        content: "Track every application stage from applied to offer, with an append-only audit trail.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pipeline,
});

const FILTERS = ["All", "High Priority", "Active", "Archived"] as const;

const stats = [
  { label: "Total Active", value: 24, tone: "text-foreground" },
  { label: "OAs Pending", value: 5, tone: "text-warning" },
  { label: "Interviews", value: 3, tone: "text-info" },
  { label: "Offers", value: 1, tone: "text-success" },
];

function Pipeline() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [active, setActive] = useState<Application | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return APPLICATIONS.filter((a) => {
      if (q && !`${a.company} ${a.role} ${a.stack.join(" ")}`.toLowerCase().includes(q))
        return false;
      if (filter === "High Priority") return !!a.priority;
      if (filter === "Active") return a.stage !== "rejected";
      if (filter === "Archived") return a.stage === "rejected";
      return true;
    });
  }, [query, filter]);

  return (
    <div className="min-h-screen">
      <TopNav />

      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-baseline gap-2 rounded-lg border border-border bg-surface px-3 py-2"
            >
              <span className={cn("text-lg font-semibold tabular-nums", s.tone)}>{s.value}</span>
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
            </div>
          ))}

          <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search company, role, stack…"
                className="h-9 w-full rounded-md border border-input bg-surface pl-8 pr-14 text-xs outline-none placeholder:text-muted-foreground focus:border-ring"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] transition-colors",
                filter === f
                  ? "border-ai/50 bg-ai/15 text-ai"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <AttentionBanner />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {STAGES.map((stage) => {
            const cards = visible.filter((a) => a.stage === stage.id);
            return (
              <section
                key={stage.id}
                className="flex min-h-40 flex-col rounded-lg border border-border bg-background/40"
              >
                <header className="flex items-center gap-2 border-b border-border px-3 py-2">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      stage.id === "applied" && "bg-info",
                      stage.id === "oa" && "bg-warning",
                      stage.id === "interview" && "bg-ai",
                      stage.id === "offer" && "bg-success",
                      stage.id === "rejected" && "bg-danger",
                    )}
                  />
                  <h2 className="text-xs font-semibold">{stage.label}</h2>
                  <span className="rounded bg-elevated px-1.5 text-[10px] tabular-nums text-muted-foreground">
                    {cards.length}
                  </span>
                </header>
                <div className="flex flex-col gap-2 p-2">
                  {cards.map((a) => (
                    <AppCard key={a.id} app={a} onOpen={setActive} />
                  ))}
                  {cards.length === 0 && (
                    <p className="px-1 py-4 text-center text-[11px] text-muted-foreground">
                      {stage.hint}
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <DetailDrawer app={active} onClose={() => setActive(null)} />
      <Toaster />
    </div>
  );
}
