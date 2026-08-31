"use client";

import * as React from "react";
import {
  Settings,
  User,
  Store,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SettingsFrame } from "@/components/app/settings-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { getUserInitials, notifyProfileUpdated } from "@/lib/auth/display-user";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { useT } from "@/lib/i18n";
import { useLocale } from "@/lib/locale/resolve";
import { cn } from "@/lib/utils";
import {
  CATEGORY_OPTIONS,
  CHALLENGE_OPTIONS,
  COUNTRY_OPTIONS,
  GOAL_OPTIONS,
  LANGUAGE_OPTIONS,
  ORDERS_OPTIONS,
  PLATFORM_OPTIONS,
  STORE_SIZE_OPTIONS,
  TRAFFIC_OPTIONS,
} from "@/lib/onboarding/constants";

type BizForm = {
  businessName: string;
  storeUrl: string;
  country: string;
  primaryLanguage: string;
  platform: string;
  storeSize: string;
  businessCategory: string;
  primaryGoal: string;
  monthlyTraffic: string;
  monthlyOrders: string;
  mainChallenge: string;
  competitorUrl: string;
};

const EMPTY_FORM: BizForm = {
  businessName: "",
  storeUrl: "",
  country: "",
  primaryLanguage: "",
  platform: "",
  storeSize: "",
  businessCategory: "",
  primaryGoal: "",
  monthlyTraffic: "",
  monthlyOrders: "",
  mainChallenge: "",
  competitorUrl: "",
};

const SELECT_CLASS =
  "flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function SelectField({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  const t = useT();
  return (
    <Field label={label} hint={hint}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={SELECT_CLASS}>
        <option value="">{t("settings.selectPlaceholder")}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="col-span-full text-xs font-semibold tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

function SavedBadge({ visible, label }: { visible: boolean; label: string }) {
  if (!visible) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
      <CheckCircle2 className="size-3.5" /> {label}
    </span>
  );
}

function SettingsFormSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <Card>
        <CardHeader className="border-b border-border/50 pb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-4 w-56" />
        </CardHeader>
        <CardContent className="pt-5">
          <div className="mb-6 flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="border-b border-border/50 pb-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-2 h-4 w-64 max-w-full" />
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const t = useT();
  const { locale } = useLocale();
  const { user } = useAuth();
  const authInitials = user ? getUserInitials(user) : "?";

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [timezone, setTimezone] = React.useState("");
  const [loadingAccount, setLoadingAccount] = React.useState(true);
  const [savingAccount, setSavingAccount] = React.useState(false);
  const [savedAccount, setSavedAccount] = React.useState(false);

  const [biz, setBiz] = React.useState<BizForm>(EMPTY_FORM);
  const [loadingBiz, setLoadingBiz] = React.useState(true);
  const [savingBiz, setSavingBiz] = React.useState(false);
  const [savedBiz, setSavedBiz] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profileRes, onboardingRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/onboarding"),
        ]);

        if (profileRes.ok) {
          const data = (await profileRes.json()) as {
            profile?: {
              fullName?: string;
              email?: string;
              timezone?: string;
              locale?: string;
            };
          };
          if (!cancelled && data.profile) {
            setFullName(data.profile.fullName || "");
            setEmail(data.profile.email || user?.email || "");
            setTimezone(data.profile.timezone || "");
          }
        }

        if (onboardingRes.ok) {
          const data = (await onboardingRes.json()) as { onboarding?: Partial<BizForm> };
          if (!cancelled && data.onboarding) {
            setBiz({
              businessName: data.onboarding.businessName || "",
              storeUrl: data.onboarding.storeUrl || "",
              country: data.onboarding.country || "",
              primaryLanguage: data.onboarding.primaryLanguage || "",
              platform: data.onboarding.platform || "",
              storeSize: data.onboarding.storeSize || "",
              businessCategory: data.onboarding.businessCategory || "",
              primaryGoal: data.onboarding.primaryGoal || "",
              monthlyTraffic: data.onboarding.monthlyTraffic || "",
              monthlyOrders: data.onboarding.monthlyOrders || "",
              mainChallenge: data.onboarding.mainChallenge || "",
              competitorUrl: data.onboarding.competitorUrl || "",
            });
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingAccount(false);
          setLoadingBiz(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const setBizField = <K extends keyof BizForm>(key: K, value: BizForm[K]) => {
    setBiz((prev) => ({ ...prev, [key]: value }));
    setSavedBiz(false);
  };

  const saveAccount = async () => {
    setSavingAccount(true);
    setSavedAccount(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          locale,
          timezone,
          businessName: biz.businessName,
          country: biz.country,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(data.error || t("settings.saveProfileError"));
        return;
      }
      const data = (await res.json()) as { profile?: { fullName?: string; email?: string } };
      if (data.profile?.fullName != null) setFullName(data.profile.fullName);
      if (data.profile?.email) setEmail(data.profile.email);
      notifyProfileUpdated(data.profile?.fullName ?? fullName);
      const supabase = getSupabaseBrowser();
      if (supabase) {
        await supabase.auth.refreshSession();
      }
      setSavedAccount(true);
      toast.success(t("settings.saved"));
    } catch {
      toast.error(t("settings.networkError"));
    } finally {
      setSavingAccount(false);
    }
  };

  const saveBusinessProfile = async () => {
    setSavingBiz(true);
    setSavedBiz(false);
    try {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "settings", answers: biz }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(data.error || t("settings.saveBusinessError"));
        return;
      }
      setSavedBiz(true);
      toast.success(t("settings.saved"));
    } catch {
      toast.error(t("settings.saveBusinessError"));
    } finally {
      setSavingBiz(false);
    }
  };

  const initials = fullName
    ? fullName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("") || authInitials
    : authInitials;

  const loading = loadingAccount || loadingBiz;

  return (
    <PageShell>
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} icon={Settings} />
      <PageContent>
        <SettingsFrame>
          {loading ? (
            <SettingsFormSkeleton />
          ) : (
            <>
              <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="size-4 text-primary" />
                        {t("settings.profile")}
                      </CardTitle>
                      <CardDescription className="mt-1.5">{t("settings.profileDesc")}</CardDescription>
                    </div>
                    <SavedBadge visible={savedAccount} label={t("settings.saved")} />
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="mb-6 flex items-center gap-4">
                    <Avatar className="size-16 ring-2 ring-primary/15 ring-offset-2 ring-offset-background">
                      <AvatarFallback className="gradient-brand text-xl font-bold text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{fullName || "—"}</div>
                      <div className="truncate text-sm text-muted-foreground">{email || "—"}</div>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t("settings.fullName")}>
                      <Input
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setSavedAccount(false);
                        }}
                        autoComplete="name"
                      />
                    </Field>
                    <Field label={t("settings.email")} hint={t("settings.emailReadOnly")}>
                      <Input value={email} readOnly className="bg-muted/40" autoComplete="email" />
                    </Field>
                    <Field label={t("settings.timezone")} hint={t("settings.timezoneHint")}>
                      <Input
                        value={timezone}
                        onChange={(e) => {
                          setTimezone(e.target.value);
                          setSavedAccount(false);
                        }}
                        placeholder="Africa/Cairo"
                        dir="ltr"
                        className="text-left"
                      />
                    </Field>
                  </div>
                  <div className="mt-6 flex justify-end border-t border-border/50 pt-4">
                    <Button
                      className="rounded-xl"
                      disabled={savingAccount}
                      onClick={() => void saveAccount()}
                    >
                      {savingAccount ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        t("settings.saveChanges")
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Store className="size-4 text-primary" />
                        {t("settings.businessProfile")}
                      </CardTitle>
                      <CardDescription className="mt-1.5">
                        {t("settings.businessProfileDesc")}
                      </CardDescription>
                    </div>
                    <SavedBadge visible={savedBiz} label={t("settings.saved")} />
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <GroupLabel>{t("settings.groupStore")}</GroupLabel>
                    <Field label={t("settings.businessName")}>
                      <Input
                        value={biz.businessName}
                        onChange={(e) => setBizField("businessName", e.target.value)}
                      />
                    </Field>
                    <Field label={t("onboarding.store.url")}>
                      <Input
                        type="url"
                        value={biz.storeUrl}
                        onChange={(e) => setBizField("storeUrl", e.target.value)}
                      />
                    </Field>
                    <SelectField
                      label={t("settings.country")}
                      value={biz.country}
                      onChange={(v) => setBizField("country", v)}
                      options={COUNTRY_OPTIONS}
                    />
                    <SelectField
                      label={t("settings.primaryLanguage")}
                      hint={t("settings.storeLanguageDesc")}
                      value={biz.primaryLanguage}
                      onChange={(v) => setBizField("primaryLanguage", v)}
                      options={LANGUAGE_OPTIONS}
                    />
                    <SelectField
                      label={t("settings.platform")}
                      value={biz.platform}
                      onChange={(v) => setBizField("platform", v)}
                      options={PLATFORM_OPTIONS}
                    />

                    <GroupLabel>{t("settings.groupScale")}</GroupLabel>
                    <SelectField
                      label={t("settings.storeSize")}
                      value={biz.storeSize}
                      onChange={(v) => setBizField("storeSize", v)}
                      options={STORE_SIZE_OPTIONS}
                    />
                    <SelectField
                      label={t("settings.category")}
                      value={biz.businessCategory}
                      onChange={(v) => setBizField("businessCategory", v)}
                      options={CATEGORY_OPTIONS}
                    />
                    <SelectField
                      label={t("settings.monthlyTraffic")}
                      value={biz.monthlyTraffic}
                      onChange={(v) => setBizField("monthlyTraffic", v)}
                      options={TRAFFIC_OPTIONS}
                    />
                    <SelectField
                      label={t("settings.monthlyOrders")}
                      value={biz.monthlyOrders}
                      onChange={(v) => setBizField("monthlyOrders", v)}
                      options={ORDERS_OPTIONS}
                    />

                    <GroupLabel>{t("settings.groupGoals")}</GroupLabel>
                    <SelectField
                      label={t("settings.primaryGoalLabel")}
                      value={biz.primaryGoal}
                      onChange={(v) => setBizField("primaryGoal", v)}
                      options={GOAL_OPTIONS}
                    />
                    <SelectField
                      label={t("settings.mainChallenge")}
                      value={biz.mainChallenge}
                      onChange={(v) => setBizField("mainChallenge", v)}
                      options={CHALLENGE_OPTIONS}
                    />
                    <Field label={t("auditNew.competitorUrl")} className="sm:col-span-2">
                      <Input
                        type="url"
                        value={biz.competitorUrl}
                        onChange={(e) => setBizField("competitorUrl", e.target.value)}
                        placeholder="https://competitor.com"
                      />
                    </Field>
                  </div>
                  <div className="mt-6 flex justify-end border-t border-border/50 pt-4">
                    <Button
                      className="rounded-xl"
                      disabled={savingBiz}
                      onClick={() => void saveBusinessProfile()}
                    >
                      {savingBiz ? <Loader2 className="size-4 animate-spin" /> : t("settings.saveChanges")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </SettingsFrame>
      </PageContent>
    </PageShell>
  );
}
