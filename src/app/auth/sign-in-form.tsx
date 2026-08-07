"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AuthError,
  AuthField,
  AuthShell,
} from "@/components/auth/auth-shell";
import {
  clearAuthReturnUrl,
  getAuthReturnUrl,
} from "@/lib/booking/draft";
import { validateSignIn } from "@/lib/auth-validation";
import { signInWithEmail } from "@/lib/firebase/auth-actions";
import { getDb } from "@/lib/firebase/firestore";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = useMemo(() => getDb(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnUrl =
    searchParams.get("return") || getAuthReturnUrl() || "/dashboard/bookings";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateSignIn(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!db) {
      setError("Firebase is not configured.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(db, email, password);
      clearAuthReturnUrl();
      router.replace(returnUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Use your Repair Series account — same as the mobile app."
    >
      {error ? <AuthError message={error} /> : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <AuthField
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Enter email address"
          autoComplete="email"
        />
        <AuthField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter password"
          autoComplete="current-password"
        />

        <div className="text-right">
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-[#f96316] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-full"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#64748b]">
        Don&apos;t have an account?{" "}
        <Link
          href={`/auth/sign-up${searchParams.get("return") ? `?return=${encodeURIComponent(searchParams.get("return")!)}` : ""}`}
          className="font-semibold text-[#f96316] hover:underline"
        >
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}
