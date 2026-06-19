import Link from "next/link";

export default function NotFound() {
  return (
    <div className="error-page">
      <div className="error-page-content">
        <p className="error-page-code">404</p>
        <h1 className="error-page-title">Page not found</h1>
        <p className="error-page-desc">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="error-page-actions">
          <Link href="/" className="btn btn-primary" style={{ width: "auto" }}>
            Go home
          </Link>
          <Link href="/login" className="btn btn-ghost" style={{ width: "auto" }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
