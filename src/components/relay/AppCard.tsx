import { Clock, Eye, PenLine, ArrowUpRight, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Application } from "@/lib/relay-data";

const sourceTone: Record<string, "info" | "muted" | "ai"> = {
  Naukri: "info",
  LinkedIn: "info",
  "Gmail Auto": "ai",
  Manual: "muted",
  Direct: "muted",
};

export function AppCard({
  app,
  onOpen,
}: {
  app: Application;
  onOpen: (app: Application) => void;
}) {
  return (
    <article
      onClick={() => onOpen(app)}
      className="group cursor-pointer rounded-lg border border-border bg-surface p-3 shadow-sm transition-colors hover:border-ai/35 hover:bg-elevated"
    >
      <div className="flex items-start gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-elevated text-xs font-semibold">
          {app.company.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold leading-tight">{app.company}</h3>
            {app.priority && <Flame className="size-3.5 shrink-0 text-warning" />}
          </div>
          <p className="truncate text-xs text-muted-foreground">{app.role}</p>
        </div>
        <Badge variant={sourceTone[app.source] ?? "muted"} className="shrink-0 px-1.5 py-0 text-[10px]">
          {app.source}
        </Badge>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Clock className="size-3" />
        {app.applied}
      </div>

      {app.deadline && (
        <div className="mt-2">
          <Badge variant={app.deadlineTone ?? "warning"} className="px-1.5 py-0 text-[10px]">
            {app.deadline}
          </Badge>
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap gap-1">
        {app.stack.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-3 hidden items-center gap-3 border-t border-border pt-2 text-[11px] text-muted-foreground group-hover:flex">
        <span className="inline-flex items-center gap-1 hover:text-foreground">
          <Eye className="size-3" /> View Snapshot
        </span>
        <span className="inline-flex items-center gap-1 hover:text-foreground">
          <PenLine className="size-3" /> Quick Override
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-ai">
          Open <ArrowUpRight className="size-3" />
        </span>
      </div>
    </article>
  );
}
