"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { AuthConfigBanner } from "@/components/auth/auth-config-banner";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { DEFAULT_POST_AUTH_PATH } from "@/lib/auth/constants";
import { signInWithEmailPassword } from "@/lib/auth/supabase-auth";
import { useSubmitGuard } from "@/hooks/use-submit-guard";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? DEFAULT_POST_AUTH_PATH;
  const { guard } = useSubmitGuard();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await guard(async () => {
      setLoading(true);
      const { error: authError } = await signInWithEmailPassword(email, password);
      if (authError) {
        setError(authError.message);
        return false;
      }
      router.push(redirect);
      router.refresh();
      return true;
    });

    setLoading(false);
    if (result === null) return;
  };

  const handleDemo = () => {
    router.push("/");
  };

  return (
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <span className="text-4xl">🗺️</span>
        <h1 className="font-display mt-4 text-2xl font-bold">Welcome to Smart Map</h1>
        <p className="text-giga-muted mt-2">Sign in to sync places, safety profile, and alerts</p>
      </div>

      <AuthConfigBanner />

      <GoogleSignInButton redirectPath={redirect} className="mb-6" />

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-giga-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-giga-surface px-3 text-giga-muted">or sign in with email</span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-bold mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-giga-border p-3 min-h-[48px] focus:ring-4 focus:ring-giga-purple/20 dark:bg-giga-surface"
            required
            autoComplete="email"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-bold mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-giga-border p-3 min-h-[48px] focus:ring-4 focus:ring-giga-purple/20 dark:bg-giga-surface"
            required
            autoComplete="current-password"
            disabled={loading}
          />
        </div>

        {error && (
          <p className="text-giga-red text-sm font-medium rounded-xl bg-giga-red/10 px-3 py-2" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading} disabled={loading}>
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Button variant="ghost" onClick={handleDemo} className="w-full" disabled={loading}>
          Continue as Guest (Demo)
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-giga-muted">
        No account?{" "}
        <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-giga-purple font-bold hover:underline">
          Create one free
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Suspense fallback={<AuthFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
