import { useEffect, useState } from "react";
import { AlertTriangle, ChevronDown, X, CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { type Application } from "@/lib/relay-data";
import { updatePortalText } from "@/lib/api";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "relay_ambiguous_banner_resolved";

export function AttentionBanner({
  applications = [],
  onResolved,
}: {
  applications?: Application[];
  onResolved?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [isDismissed, setIsDismissed] = useState(true); // default true until checked
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    // Check local storage to see if candidate already dismissed or resolved this action item
    const resolved = localStorage.getItem(STORAGE_KEY);
    if (resolved === "true") {
      setIsDismissed(true);
    } else {
      // Check if there are applications matching Swiggy/Bundl or any ambiguous candidate in the list
      const hasCandidates = applications.some(
        (a) =>
          a.company.toLowerCase().includes("swiggy") ||
          a.company.toLowerCase().includes("bundl"),
      );
      // Only show if there are candidate applications to disambiguate
      setIsDismissed(!hasCandidates);
    }
  }, [applications]);

  if (isDismissed) return null;

  // Find Swiggy / Bundl applications that could match
  const matchingApps = applications.filter(
    (a) =>
      a.company.toLowerCase().includes("swiggy") ||
      a.company.toLowerCase().includes("bundl"),
  );

  async function handleAssign(targetApp: Application) {
    setIsResolving(true);
    try {
      await updatePortalText(
        targetApp.id,
        `Candidate manually disambiguated inbound email from “Bundl Technologies” and assigned to role: ${targetApp.role}.`,
      );
      toast.success(`Assigned email to ${targetApp.company} (${targetApp.role})`);
      localStorage.setItem(STORAGE_KEY, "true");
      setIsDismissed(true);
      onResolved?.();
    } catch (err: any) {
      console.error("Failed to assign ambiguous email:", err);
      toast.error(err.message || "Failed to commit assignment to backend.");
    } finally {
      setIsResolving(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
    toast("Ambiguous email notification dismissed.");
  }

  function handleCreateNew() {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
    router.navigate({ to: "/new-drop" });
  }

  return (
    <div className="rounded-lg border border-warning/40 bg-warning/15">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <AlertTriangle className="size-4 text-warning shrink-0" />
        <span className="text-xs font-semibold text-warning">
          Action Required: Inbound Email from “Bundl Technologies” (Swiggy)
        </span>
        <ChevronDown
          className={cn(
            "ml-auto size-4 text-warning transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="flex flex-wrap items-center gap-2 border-t border-warning/30 px-3 py-3">
          <p className="mr-2 text-xs text-muted-foreground">
            Inbound email received with no role specified. Select which application to attach this to:
          </p>

          {matchingApps.slice(0, 3).map((a) => (
            <Button
              key={a.id}
              size="sm"
              variant="subtle"
              disabled={isResolving}
              className="text-xs gap-1"
              onClick={() => handleAssign(a)}
            >
              <CheckCircle2 className="size-3 text-success" />
              Assign to {a.role}
            </Button>
          ))}

          <Button
            size="sm"
            variant="subtle"
            disabled={isResolving}
            className="text-xs gap-1"
            onClick={handleCreateNew}
          >
            <ArrowRight className="size-3" />
            Create New Application
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground ml-auto"
            onClick={handleDismiss}
          >
            <X className="size-3.5" /> Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}
