import { useState } from "react";
import { AlertTriangle, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AttentionBanner() {
  const [open, setOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="rounded-lg border border-warning/25 bg-warning/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <AlertTriangle className="size-4 text-warning" />
        <span className="text-xs font-semibold text-warning">
          Action Required: 1 Ambiguous Email Detected
        </span>
        <ChevronDown
          className={cn(
            "ml-auto size-4 text-warning transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="flex flex-wrap items-center gap-2 border-t border-warning/15 px-3 py-3">
          <p className="mr-2 text-xs text-muted-foreground">
            Email from <span className="text-foreground">“Bundl Technologies”</span> with no role
            specified. 2 active applications match.
          </p>
          {["Assign to SDE-1", "Assign to Backend Engineer", "Create New"].map((a) => (
            <Button
              key={a}
              size="sm"
              variant="subtle"
              onClick={() => toast.success(`${a} — event appended to log`)}
            >
              {a}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
            <X /> Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}
