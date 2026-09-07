"use client";

import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";

export type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthed: boolean;
  signOut: () => Promise<void>;
};

export const UNAUTHED_AUTH: AuthContextValue = {
  user: null,
  session: null,
  loading: false,
  isAuthed: false,
  signOut: async () => {},
};

export const AuthContext = React.createContext<AuthContextValue>(UNAUTHED_AUTH);

export function useAuth(): AuthContextValue {
  return React.useContext(AuthContext);
}
