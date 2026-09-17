import { useState } from "react";
import {
  Bot,
  User,
  Zap,
  ChevronDown,
  Copy,
  FileText,
  AlertTriangle,
  Download,
  CheckCircle2,
  Loader2,
  Clock,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { STAGES, type Application, type TimelineEvent, type Stage } from "@/lib/relay-data";
import { overrideStatus, updatePortalText } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatApplied, formatFullDateTime, formatTimelineDate } from "@/lib/date-format";

const originMeta = {
  worker: { label: "Gmail Worker", Icon: Bot, tone: "ai" as const },
  manual: { label: "Manual Drop", Icon: User, tone: "info" as const },
  override: { label: "Direct Override", Icon: Zap, tone: "warning" as const },
};

function TimelineRow({ event, last }: { event: TimelineEvent; last: boolean }) {
  const [open, setOpen] = useState(false);
  const meta = originMeta[event.origin] || originMeta.manual;
  const { label, Icon, tone } = meta;
  const timeFormatted = formatTimelineDate(event.date, event.timestamp);

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
          <span
            className="ml-auto font-mono text-[11px] text-muted-foreground cursor-help"
            title={timeFormatted.full || undefined}
          >
            {timeFormatted.display}
          </span>
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

const STAGE_TO_BACKEND: Record<string, string> = {
  applied: "APPLIED",
  oa: "OA_PENDING",
  interview: "INTERVIEW_ROUND",
  offer: "OFFER",
  rejected: "REJECTED",
  withdrawn: "WITHDRAWN",
};

export function DetailDrawer({
  app,
  onClose,
  onUpdated,
}: {
  app: Application | null;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [overrideStage, setOverrideStage] = useState<string>("interview");
  const [forceStage, setForceStage] = useState<string>("applied");
  const [note, setNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [portalText, setPortalText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!app) return null;
  const stage = STAGES.find((s) => s.id === app.stage);
  if (!stage) return null;

  async function handleDirectOverride(targetStageKey: string, customNote?: string) {
    if (!app) return;
    const backendStatus = STAGE_TO_BACKEND[targetStageKey] || targetStageKey.toUpperCase();
    setIsUpdating(true);
    try {
      const res = await overrideStatus(app.id, backendStatus, customNote ?? note);
      if (res.success) {
        toast.success(`Stage updated to ${res.new_status} (Direct Override)`);
        setNote("");
        onUpdated?.();
      }
    } catch (err: any) {
      console.error("Override error:", err);
      toast.error(err.message || "Failed to update status on backend.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handlePortalSnippetUpdate() {
    if (!app) return;
    if (!portalText.trim()) {
      toast.error("Please paste a recruiter message or portal update first.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await updatePortalText(app.id, portalText);
      if (res.success) {
        toast.success(`Message analyzed! Stage updated to: ${res.new_status}`);
        setPortalText("");
        onUpdated?.();
      }
    } catch (err: any) {
      console.error("Portal update error:", err);
      toast.error(err.message || "Failed to analyze portal snippet on backend.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleCopyResume() {
    if (!app?.resume) {
      toast.error("No resume snapshot found for this application.");
      return;
    }
    navigator.clipboard?.writeText(app.resume);
    toast.success("Resume markdown copied to clipboard");
  }

  function handleDownloadResume() {
    if (!app?.resume) return;
    const blob = new Blob([app.resume], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeCompany = app.company.toLowerCase().replace(/\s+/g, "_");
    link.setAttribute("download", `${safeCompany}_resume_snapshot.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Resume markdown downloaded");
  }

  return (
    <>
      <Sheet open={!!app} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="w-full overflow-y-auto border-border bg-background p-0 scroll-thin sm:max-w-xl">
          <SheetHeader className="sticky top-0 z-10 border-b border-border bg-background/95 p-5 backdrop-blur">
            <div className="flex items-start gap-3">
              <span className="grid size-9 place-items-center rounded-md border border-border bg-surface text-sm font-semibold uppercase">
                {app.company.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <SheetTitle className="truncate text-base">{app.company}</SheetTitle>
                <p className="truncate text-xs text-muted-foreground">
                  {app.role} · {app.location || "Remote"}
                </p>
                <p
                  className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground"
                  title={formatFullDateTime(app.applied_at || app.applied)}
                >
                  <Clock className="size-3 shrink-0" />
                  <span>{formatApplied(app.applied, app.applied_at)}</span>
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
                onClick={() => toast("Use 'Update Status' below to advance or override the stage")}
              >
                {stage.label}
              </Badge>
              <Button
                size="sm"
                variant="subtle"
                className="ml-auto gap-1 text-xs"
                onClick={() => setShowResumeModal(true)}
              >
                <FileText className="size-3.5" /> View Submitted Resume Snapshot
              </Button>
            </div>
          </SheetHeader>

          <div className="space-y-6 p-5">
            <section>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Stage History &amp; Audit Trail
              </h4>
              {app.timeline && app.timeline.length > 0 ? (
                <ol>
                  {app.timeline.map((e, i) => (
                    <TimelineRow key={e.id} event={e} last={i === app.timeline.length - 1} />
                  ))}
                </ol>
              ) : (
                <p className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                  No previous events recorded.
                </p>
              )}
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
                  <Select value={overrideStage} onValueChange={setOverrideStage}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Next stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oa">OA Pending</SelectItem>
                      <SelectItem value="interview">Interview Rounds</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                      <SelectItem value="applied">Applied (Reset)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional note (e.g. recruiter call outcome, test link)"
                    className="bg-background"
                  />
                  <Button
                    className="w-full gap-2"
                    disabled={isUpdating}
                    onClick={() => handleDirectOverride(overrideStage)}
                  >
                    {isUpdating && <Loader2 className="size-3.5 animate-spin" />}
                    Update Status
                  </Button>
                </TabsContent>

                <TabsContent value="paste" className="mt-3 space-y-2.5">
                  <Textarea
                    rows={5}
                    value={portalText}
                    onChange={(e) => setPortalText(e.target.value)}
                    placeholder="Paste email / portal update message (e.g. 'Congratulations, you have been shortlisted for technical interview on Google Meet')..."
                    className="resize-none bg-background font-mono text-xs"
                  />
                  <Button
                    variant="ai"
                    className="w-full gap-2"
                    disabled={isAnalyzing}
                    onClick={handlePortalSnippetUpdate}
                  >
                    {isAnalyzing && <Loader2 className="size-3.5 animate-spin" />}
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
                      Backward corrections bypass the forward state DAG and are committed with source
                      MANUAL_OVERRIDE at zero LLM cost.
                    </p>
                    <Select value={forceStage} onValueChange={setForceStage}>
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
                      disabled={isUpdating}
                      onClick={() => handleDirectOverride(forceStage, "Forced diagnostic state override")}
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
                  className="ml-auto gap-1 text-xs"
                  onClick={handleCopyResume}
                >
                  <Copy className="size-3.5" /> Copy
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-xs"
                  onClick={handleDownloadResume}
                >
                  <Download className="size-3.5" /> Export
                </Button>
              </div>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-muted-foreground scroll-thin">
                {app.resume || "No resume snapshot found for this application."}
              </pre>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dedicated Full Modal for Viewing the Submitted Resume Snapshot */}
      <Dialog open={showResumeModal} onOpenChange={setShowResumeModal}>
        <DialogContent className="max-h-[85vh] sm:max-w-2xl flex flex-col p-6">
          <DialogHeader className="border-b border-border pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle className="text-base font-semibold">
                Resume Snapshot — {app.company}
              </DialogTitle>
              <Badge variant="success" className="gap-1 px-1.5 py-0 text-[10px]">
                <CheckCircle2 className="size-3" /> Grounded in Master Vault
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {app.role} · Applied via {app.source}
            </p>
          </DialogHeader>

          <div className="flex items-center gap-2 pt-2">
            <Button size="sm" variant="subtle" className="gap-1.5 text-xs" onClick={handleCopyResume}>
              <Copy className="size-3.5" /> Copy Markdown
            </Button>
            <Button size="sm" variant="subtle" className="gap-1.5 text-xs" onClick={handleDownloadResume}>
              <Download className="size-3.5" /> Download .md
            </Button>
          </div>

          <pre className="mt-2 flex-1 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-4 font-mono text-xs leading-relaxed text-foreground/90 scroll-thin select-text">
            {app.resume || "# No resume snapshot available"}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
}
