"use client";
import Link from "next/link";
import { clearUser, getUser } from "@/common/lib";

export default function UnauthorizedPage() {
  const user = getUser();
  const homeHref = user?.role === "employee" ? "/employee/tasks" : "/dashboard";
  const loginHref = user?.role === "employee" ? "/employee-login" : "/login";

  const handleSignOut = () => {
    clearUser();
    window.location.href = loginHref;
  };

  return (
    <div className="error-page">
      <div className="error-page-content">
        <p className="error-page-code">403</p>
        <h1 className="error-page-title">Access denied</h1>
        <p className="error-page-desc">
          You don&apos;t have permission to view this page. Sign in with the correct account or
          return to your dashboard.
        </p>
        <div className="error-page-actions">
          <Link href={homeHref} className="btn btn-primary" style={{ width: "auto" }}>
            Go to dashboard
          </Link>
          <button type="button" className="btn btn-ghost" style={{ width: "auto" }} onClick={handleSignOut}>
            Sign in again
          </button>
        </div>
      </div>
    </div>
  );
}
