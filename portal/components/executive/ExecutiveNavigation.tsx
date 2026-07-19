"use client";

import Link from "next/link";
import { ArrowLeft, Home, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ExecutiveNavigation() {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const home = pathname === "/executive";

  async function signOut() {
    setSigningOut(true);
    await supabaseBrowser.auth.signOut();
    window.location.replace("/staff/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] shadow-sm backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        {home ? (
          <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-bold text-[#123E74]">
            <Home className="h-4 w-4" />
            Family OS
          </Link>
        ) : (
          <Link href="/executive" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-bold text-[#123E74]">
            <ArrowLeft className="h-4 w-4" />
            Executive
          </Link>
        )}
        <button type="button" onClick={() => void signOut()} disabled={signingOut} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#D7193F] px-4 text-sm font-bold text-white disabled:opacity-60">
          <LogOut className="h-4 w-4" />
          {signingOut ? "Signing out…" : "Log out"}
        </button>
      </div>
    </header>
  );
}
