"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useQueryMyTasks, useMarkTaskDoneMutation } from "@/shared/hooks";
import { TaskListSkeleton } from "@/shared/components";
import { EmployeeTaskCard } from "../components";

export function EmployeeTasksPage() {
  const { data, isLoading } = useQueryMyTasks();
  const markDoneMutation = useMarkTaskDoneMutation();
  const [completing, setCompleting] = useState<string | null>(null);

  const tasks = data?.tasks ?? [];
  const pending = tasks.filter((t) => t.status === "pending");
  const done = tasks.filter((t) => t.status === "done");

  const handleMarkDone = async (taskId: string) => {
    setCompleting(taskId);
    try {
      await markDoneMutation.mutateAsync(taskId);
      toast.success("Task marked as done! 🎉");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? "Failed to update task");
    } finally {
      setCompleting(null);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="skeleton" style={{ width: 140, height: 32, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 200, height: 16 }} />
          </div>
        </div>
        <TaskListSkeleton count={4} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">
            {pending.length} pending · {done.length} completed
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <p className="empty-state-title">No tasks yet</p>
          <p className="empty-state-desc">Your manager will assign tasks to you soon</p>
        </div>
      ) : (
        <div>
          {pending.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 16,
                }}
              >
                Pending ({pending.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pending.map((task, i) => (
                  <EmployeeTaskCard
                    key={task.id}
                    task={task}
                    index={i}
                    isCompleting={completing === task.id}
                    onMarkDone={handleMarkDone}
                  />
                ))}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 16,
                }}
              >
                Completed ({done.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {done.map((task, i) => (
                  <EmployeeTaskCard
                    key={task.id}
                    task={task}
                    index={i}
                    isCompleting={false}
                    onMarkDone={handleMarkDone}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
