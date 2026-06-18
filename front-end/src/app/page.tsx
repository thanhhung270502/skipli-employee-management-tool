"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/common/lib";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
    } else if (user.role === "owner") {
      router.replace("/dashboard");
    } else {
      router.replace("/employee/tasks");
    }
  }, [router]);

  return (
    <div className="page-loading">
      <div className="spinner spinner-primary" />
      <span>Redirecting...</span>
    </div>
  );
}
