"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") ?? "Authentication failed. Please try again.";

  return (
    <Card className="max-w-md w-full p-8 text-center">
      <span className="text-5xl">⚠️</span>
      <CardTitle className="mt-4">Sign-in didn&apos;t complete</CardTitle>
      <CardDescription className="mt-4 text-base">{decodeURIComponent(message)}</CardDescription>
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/login">
          <Button className="w-full">Back to Sign In</Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="w-full">Go Home</Button>
        </Link>
      </div>
    </Card>
  );
}

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
