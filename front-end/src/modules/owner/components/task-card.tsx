"use client";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import type { TaskObject } from "@/common/models/task";

interface TaskCardProps {
  task: TaskObject;
  index: number;
}

const getTimestamp = (ts: unknown): Date | null => {
  if (!ts) return null;
  if (ts instanceof Date) {
    return isNaN(ts.getTime()) ? null : ts;
  }
  if (typeof ts === "object") {
    const t = ts as { _seconds?: number; seconds?: number; toDate?: () => Date };
    if (typeof t.toDate === "function") {
      try {
        const d = t.toDate();
        return isNaN(d.getTime()) ? null : d;
      } catch {
        // ignore
      }
    }
    const secs = t._seconds ?? t.seconds;
    if (typeof secs === "number") {
      return new Date(secs * 1000);
    }
  }
  if (typeof ts === "string" || typeof ts === "number") {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

export function TaskCard({ task, index }: TaskCardProps) {
  const dueDate = getTimestamp(task.dueDate);

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{ display: "flex", alignItems: "flex-start", gap: 16 }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          flexShrink: 0,
          marginTop: 4,
          background:
            task.status === "done" ? "var(--success)" : "var(--warning)",
          boxShadow:
            task.status === "done"
              ? "0 0 8px rgba(16,185,129,0.4)"
              : "0 0 8px rgba(245,158,11,0.4)",
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
            {task.title}
          </h3>
          <span
            className={`badge ${
              task.status === "done" ? "badge-success" : "badge-warning"
            }`}
          >
            {task.status}
          </span>
        </div>
        {task.description && (
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginTop: 4,
            }}
          >
            {task.description}
          </p>
        )}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            👤 {task.assignedToName}
          </span>
          {dueDate && (
            <span
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Calendar size={11} />
              {dueDate.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
