"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/supabase/auth-actions";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="h-10 w-10 rounded-full bg-giga-purple/10 animate-pulse" aria-hidden />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Link href="/login" aria-label="Sign in">
        <Button variant="ghost" size="sm" className="gap-2 min-h-[48px] text-base font-semibold px-3">
          <LogIn className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          Sign In
        </Button>
      </Link>
    );
  }

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Member";

  const avatar =
    user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-2 max-w-[140px]">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-giga-purple/20 flex items-center justify-center">
            <User className="h-4 w-4 text-giga-purple" />
          </div>
        )}
        <span className="text-sm font-semibold truncate">{displayName}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="gap-1.5 min-h-[44px]"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign Out</span>
      </Button>
    </div>
  );
}
