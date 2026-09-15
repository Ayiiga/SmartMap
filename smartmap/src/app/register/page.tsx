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
import { signUpWithEmailPassword } from "@/lib/auth/supabase-auth";
import { DEFAULT_POST_AUTH_PATH } from "@/lib/auth/constants";
import { useSubmitGuard } from "@/hooks/use-submit-guard";
import type { UserRole } from "@/types";

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? DEFAULT_POST_AUTH_PATH;
  const { guard } = useSubmitGuard();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await guard(async () => {
      setLoading(true);
      const { data, error: authError } = await signUpWithEmailPassword(email, password, {
        full_name: fullName.trim(),
        role,
      });

      if (authError) {
        setError(authError.message);
        return false;
      }

      if (data?.needsEmailConfirmation) {
        setNeedsEmailConfirmation(true);
        setSuccess(true);
        return true;
      }

      setSuccess(true);
      setTimeout(() => router.push(redirect), 2000);
      return true;
    });

    setLoading(false);
    if (result === null) return;
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <span className="text-5xl">{needsEmailConfirmation ? "📧" : "🎉"}</span>
          <h2 className="font-display mt-4 text-2xl font-bold">
            {needsEmailConfirmation ? "Check your email" : "Welcome to Smart Map!"}
          </h2>
          <p className="mt-2 text-giga-muted">
            {needsEmailConfirmation
              ? `We sent a confirmation link to ${email}. Open it to activate your account, then sign in.`
              : "Your account is ready. Redirecting..."}
          </p>
          {needsEmailConfirmation && (
            <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="mt-6 inline-block">
              <Button className="w-full">Go to Sign In</Button>
            </Link>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">🌟</span>
          <h1 className="font-display mt-4 text-2xl font-bold">Join Smart Map</h1>
          <p className="text-giga-muted mt-2">Create your free account</p>
        </div>

        <AuthConfigBanner />

        <GoogleSignInButton redirectPath={redirect} className="mb-6" />

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-giga-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-giga-surface px-3 text-giga-muted">or register with email</span>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-bold mb-1">Full Name</label>
            <input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-giga-border p-3 min-h-[48px] dark:bg-giga-surface"
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-bold mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-giga-border p-3 min-h-[48px] dark:bg-giga-surface"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-giga-border p-3 min-h-[48px] dark:bg-giga-surface"
              required
              minLength={6}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-bold mb-1">I am a...</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-xl border border-giga-border p-3 min-h-[48px] dark:bg-giga-surface"
              disabled={loading}
            >
              <option value="student">Student / Learner</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          {error && (
            <p className="text-giga-red text-sm rounded-xl bg-giga-red/10 px-3 py-2" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading} disabled={loading}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-giga-muted">
          Already have an account?{" "}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="text-giga-purple font-bold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <RegisterForm />
    </Suspense>
  );
}
