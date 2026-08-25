"use client";

import { Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL, contactMailto } from "@/lib/seo/contact";
import { useT } from "@/lib/i18n";

export function ContactEmailActions() {
  const t = useT();

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      toast.success(t("contact.emailCopied"));
    } catch {
      toast.error(t("report.copyFailed"));
    }
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <Button asChild size="lg" className="rounded-full font-semibold shadow-glow">
        <a href={contactMailto("طلب دعم ConvAudit")}>
          <Mail className="size-4" />
          {t("contact.sendEmail")}
        </a>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="rounded-full"
        onClick={() => void copyEmail()}
      >
        <Copy className="size-4" />
        {t("contact.copyEmail")}
      </Button>
    </div>
  );
}
