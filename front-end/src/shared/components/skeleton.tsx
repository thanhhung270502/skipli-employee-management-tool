import type { CSSProperties } from "react";

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
};

export function Skeleton({ width = "100%", height = 16, className = "", style }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card skeleton-card">
      <Skeleton width={40} height={40} style={{ borderRadius: 10, marginBottom: 16 }} />
      <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height={28} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <div className="page-header">
        <div style={{ flex: 1 }}>
          <Skeleton width={180} height={32} style={{ marginBottom: 8 }} />
          <Skeleton width={320} height={16} />
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div className="card skeleton-card" key={i}>
            <Skeleton width={140} height={18} style={{ marginBottom: 20 }} />
            {Array.from({ length: 4 }).map((__, j) => (
              <div key={j} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <Skeleton width="70%" height={14} />
                <Skeleton width={60} height={22} style={{ borderRadius: 20 }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card skeleton-card">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 0",
            borderBottom: i < rows - 1 ? "1px solid var(--border-subtle)" : undefined,
          }}
        >
          <Skeleton width={36} height={36} style={{ borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Skeleton width="40%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="60%" height={12} />
          </div>
          <Skeleton width={72} height={24} style={{ borderRadius: 20 }} />
        </div>
      ))}
    </div>
  );
}

export function TaskListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div className="card skeleton-card" key={i} style={{ padding: 20 }}>
          <Skeleton width="50%" height={18} style={{ marginBottom: 10 }} />
          <Skeleton width="80%" height={14} style={{ marginBottom: 16 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Skeleton width={100} height={12} />
            <Skeleton width={72} height={24} style={{ borderRadius: 20 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
