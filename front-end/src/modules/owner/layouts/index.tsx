"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isOwner } from "@/common/lib";
import { Sidebar } from "../components";

export function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user || !isOwner()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="page-loading">
        <div className="spinner spinner-primary" />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar role="owner" />
      <main className="main-content">{children}</main>
    </div>
  );
}
