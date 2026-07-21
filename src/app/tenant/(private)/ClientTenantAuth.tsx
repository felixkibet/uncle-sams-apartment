"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export default function ClientTenantAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/tenant/validate", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("invalid");
        const data = await res.json();
        if (!data.valid) throw new Error("invalid");
        if (mounted) setChecking(false);
      })
      .catch(() => {
        router.replace("/tenant/login");
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Checking access…</div>
      </div>
    );
  }

  return <>{children}</>;
}
