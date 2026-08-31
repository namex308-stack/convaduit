import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolvePostAuthPath } from "@/lib/auth/safe-next-path";
import {
  PROFILE_GATE_SELECT,
  type ProfileGateRow,
} from "@/lib/auth/profile-gate";
import { absoluteUrl } from "@/lib/site-url";

/**
 * Supabase Auth callback — exchanges the OAuth/email code for a session cookie.
 * Configure Supabase redirect URLs to point here:
 *   {NEXT_PUBLIC_APP_URL}/auth/callback
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(absoluteUrl("/auth?error=no_code"));
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(absoluteUrl("/auth?error=supabase_not_configured"));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(
      absoluteUrl(`/auth?error=${encodeURIComponent("auth_callback_failed")}`)
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: ProfileGateRow | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select(PROFILE_GATE_SELECT)
      .eq("id", user.id)
      .maybeSingle();
    profile = (data as ProfileGateRow | null) ?? null;
  }

  const destination = resolvePostAuthPath(rawNext, profile);
  return NextResponse.redirect(absoluteUrl(destination));
}
