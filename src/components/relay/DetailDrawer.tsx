import { useState } from "react";
import { Bot, User, Zap, ChevronDown, Copy, FileText, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { STAGES, type Application, type TimelineEvent } from "@/lib/relay-data";
import { cn } from "@/lib/utils";

const originMeta = {
  worker: { label: "Gmail Worker", Icon: Bot, tone: "ai" as const },
  manual: { label: "Manual Drop", Icon: User, tone: "info" as const },
  override: { label: "Direct Override", Icon: Zap, tone: "warning" as const },
};

function TimelineRow({ event, last }: { event: TimelineEvent; last: boolean }) {
  const [open, setOpen] = useState(false);
  const { label, Icon, tone } = originMeta[event.origin];

  return (
    <li className="relative pl-9">
      {!last && <span className="absolute left-3.5 top-7 h-[calc(100%-1rem)] w-px bg-border" />}
      <span
        className={cn(
          "absolute left-0 grid size-7 place-items-center rounded-full border bg-surface",
          tone === "ai" && "border-ai/40 text-ai",
          tone === "info" && "border-info/40 text-info",
          tone === "warning" && "border-warning/40 text-warning",
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <div className="pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">{event.title}</p>
          <Badge variant={tone} className="px-1.5 py-0 text-[10px]">
            {label}
          </Badge>
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">{event.date}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{event.detail}</p>
        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
          Inspect raw payload
        </button>
        {open && (
          <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-background p-2.5 font-mono text-[11px] text-muted-foreground">
            {event.payload}
          </pre>
        )}
      </div>
    </li>
  );
}

export function DetailDrawer({
  app,
  onClose,
}: {
  app: Application | null;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");

  if (!app) return null;
  const stage = STAGES.find((s) => s.id === app.stage)!;

  return (
    <Sheet open={!!app} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-border bg-background p-0 scroll-thin sm:max-w-xl">
        <SheetHeader className="sticky top-0 z-10 border-b border-border bg-background/95 p-5 backdrop-blur">
          <div className="flex items-start gap-3">
            <span className="grid size-9 place-items-center rounded-md border border-border bg-surface text-sm font-semibold">
              {app.company.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <SheetTitle className="truncate text-base">{app.company}</SheetTitle>
              <p className="truncate text-xs text-muted-foreground">
                {app.role} · {app.location}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant={
                app.stage === "offer"
                  ? "success"
                  : app.stage === "rejected"
                    ? "danger"
                    : app.stage === "oa"
                      ? "warning"
                      : "info"
              }
              className="cursor-pointer"
              onClick={() => toast("Pick a new stage below in Update Status")}
            >
              {stage.label}
            </Badge>
            <Button size="sm" variant="subtle" className="ml-auto">
              <FileText /> View Submitted Resume Snapshot
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 p-5">
          <section>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Stage History &amp; Audit Trail
            </h4>
            <ol>
              {app.timeline.map((e, i) => (
                <TimelineRow key={e.id} event={e} last={i === app.timeline.length - 1} />
              ))}
            </ol>
          </section>

          <section className="panel p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Update Status
            </h4>
            <Tabs defaultValue="override">
              <TabsList className="bg-elevated">
                <TabsTrigger value="override">Direct Override</TabsTrigger>
                <TabsTrigger value="paste">Paste Portal Snippet</TabsTrigger>
              </TabsList>

              <TabsContent value="override" className="mt-3 space-y-2.5">
                <Select defaultValue="interview">
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Next stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oa">OA Pending</SelectItem>
                    <SelectItem value="interview">Interview Rounds</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note (e.g. recruiter call outcome)"
                  className="bg-background"
                />
                <Button
                  className="w-full"
                  onClick={() => toast.success("Status updated — event appended to log")}
                >
                  Update Status
                </Button>
              </TabsContent>

              <TabsContent value="paste" className="mt-3 space-y-2.5">
                <Textarea
                  rows={5}
                  placeholder="Paste a message from Workday / portal…"
                  className="resize-none bg-background font-mono text-xs"
                />
                <Button
                  variant="ai"
                  className="w-full"
                  onClick={() => toast.success("Snippet analyzed — stage inferred: Interview R2")}
                >
                  Analyze &amp; Update
                </Button>
              </TabsContent>
            </Tabs>

            <Accordion type="single" collapsible className="mt-3">
              <AccordionItem value="force" className="border-border">
                <AccordionTrigger className="text-xs text-warning hover:no-underline">
                  <span className="inline-flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5" /> Force State Override (Diagnostic)
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-2.5">
                  <p className="text-[11px] text-muted-foreground">
                    Backward corrections break the forward-only state machine and are recorded as
                    diagnostic events.
                  </p>
                  <Select>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Force stage…" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => toast.warning("Forced state override recorded")}
                  >
                    Force Override
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section className="panel p-4">
            <div className="mb-3 flex items-center gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Submitted Resume Snapshot
              </h4>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto"
                onClick={() => {
                  navigator.clipboard?.writeText(app.resume);
                  toast.success("Resume markdown copied");
                }}
              >
                <Copy /> Copy
              </Button>
            </div>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-muted-foreground scroll-thin">
              {app.resume}
            </pre>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
