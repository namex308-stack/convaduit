"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import {
  canRetryAuditStatus,
  deleteAuditRequest,
  retryAuditRequest,
} from "@/lib/audits/actions";
import { cn } from "@/lib/utils";

type AuditRowActionsProps = {
  auditId: string;
  status: string;
  onDeleted?: (auditId: string) => void;
  className?: string;
};

export function AuditRowActions({
  auditId,
  status,
  onDeleted,
  className,
}: AuditRowActionsProps) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = React.useState<"delete" | "retry" | null>(null);

  const showRetry = canRetryAuditStatus(status) && status === "failed";
  const showRescan = canRetryAuditStatus(status) && status === "completed";

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    if (!window.confirm(t("history.confirmDelete"))) return;

    setBusy("delete");
    try {
      const result = await deleteAuditRequest(auditId);
      if (!result.ok) {
        toast.error(result.error || t("history.deleteError"));
        return;
      }
      toast.success(t("history.deleteSuccess"));
      onDeleted?.(auditId);
    } catch {
      toast.error(t("history.deleteError"));
    } finally {
      setBusy(null);
    }
  };

  const handleRetry = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    setBusy("retry");
    try {
      const result = await retryAuditRequest(auditId);
      if (!result.ok) {
        if (result.code === "ONBOARDING_REQUIRED") {
          window.location.href = result.resumePath || "/onboarding";
          return;
        }
        toast.error(result.error || t("history.retryError"));
        return;
      }
      if (!result.auditId) {
        toast.error(t("history.retryError"));
        return;
      }
      toast.success(t("history.retryStarted"));
      router.push(`/audit/${result.auditId}/scanning`);
    } catch {
      toast.error(t("history.retryError"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className={cn("flex items-center gap-0.5 shrink-0", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {showRescan && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-full px-2.5 text-xs font-semibold"
          disabled={busy != null}
          aria-label={t("dashboard.rescan")}
          onClick={handleRetry}
        >
          {busy === "retry" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RotateCcw className="size-3.5" />
          )}
          {t("dashboard.rescan")}
        </Button>
      )}
      {showRetry && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-full text-muted-foreground hover:text-foreground"
          disabled={busy != null}
          aria-label={t("history.retry")}
          onClick={handleRetry}
        >
          {busy === "retry" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RotateCcw className="size-3.5" />
          )}
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-full text-muted-foreground hover:text-rose-600"
        disabled={busy != null}
        aria-label={t("history.delete")}
        onClick={handleDelete}
      >
        {busy === "delete" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Trash2 className="size-3.5" />
        )}
      </Button>
    </div>
  );
}
