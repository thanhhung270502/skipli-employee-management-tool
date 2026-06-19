"use client";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { TaskObject } from "@/common/models/task";

interface EmployeeTaskCardProps {
  task: TaskObject;
  index: number;
  isCompleting: boolean;
  onMarkDone: (id: string) => void;
}

const getDate = (ts: unknown): Date | null => {
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

export function EmployeeTaskCard({ task, index, isCompleting, onMarkDone }: EmployeeTaskCardProps) {
  const dueDate = getDate(task.dueDate);
  const completedAt = getDate(task.completedAt);

  if (task.status === "done") {
    return (
      <motion.div
        className="card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.04 }}
        style={{ display: "flex", alignItems: "flex-start", gap: 16, opacity: 0.7 }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            flexShrink: 0,
            marginTop: 2,
            background: "var(--success)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle size={12} style={{ color: "white" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-secondary)",
              textDecoration: "line-through",
              marginBottom: 4,
            }}
          >
            {task.title}
          </h3>
          {completedAt && (
            <span style={{ fontSize: 12, color: "var(--success)" }}>
              ✓ Completed {format(completedAt, "MMM d, yyyy")}
            </span>
          )}
        </div>
        <span className="badge badge-success">Done</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{ display: "flex", alignItems: "flex-start", gap: 16 }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          flexShrink: 0,
          marginTop: 2,
          border: "2px solid var(--warning)",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Clock size={10} style={{ color: "var(--warning)" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}
        >
          {task.title}
        </h3>
        {task.description && (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
            {task.description}
          </p>
        )}
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
            Due {format(dueDate, "MMM d, yyyy")}
          </span>
        )}
      </div>
      <button
        className="btn btn-success btn-sm"
        style={{ width: "auto", flexShrink: 0 }}
        onClick={() => onMarkDone(task.id)}
        disabled={isCompleting}
      >
        {isCompleting ? (
          <>
            <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
            Marking...
          </>
        ) : (
          <>
            <CheckCircle size={14} /> Done
          </>
        )}
      </button>
    </motion.div>
  );
}
