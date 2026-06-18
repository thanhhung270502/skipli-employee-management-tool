"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isEmployee } from "@/common/lib";
import { Sidebar } from "@/modules/owner/components";

export function EmployeePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user || !isEmployee()) {
      router.replace("/employee-login");
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
      <Sidebar role="employee" />
      <main className="main-content">{children}</main>
    </div>
  );
}
