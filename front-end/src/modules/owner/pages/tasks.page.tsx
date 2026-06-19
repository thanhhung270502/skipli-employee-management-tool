"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryAllTasks, useQueryEmployees, useCreateTaskMutation } from "@/shared/hooks";
import { TaskListSkeleton } from "@/shared/components";
import { useTaskForm } from "../hooks";
import { TaskCard, TaskFormModal } from "../components";

export function TasksPage() {
  const { data: taskData, isLoading: tasksLoading } = useQueryAllTasks();
  const { data: empData } = useQueryEmployees();
  const createTaskMutation = useCreateTaskMutation();

  const tasks = taskData?.tasks ?? [];
  const activeEmployees = (empData?.employees ?? []).filter((e) => e.isSetup);

  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  const { methods, reset } = useTaskForm();

  const handleCreateTask = methods.handleSubmit(async (data) => {
    try {
      await createTaskMutation.mutateAsync({
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo,
        dueDate: data.dueDate || undefined,
      });
      toast.success("Task created!");
      setModalOpen(false);
      reset();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? "Failed to create task");
    }
  });

  const filtered = tasks.filter((t) => (filter === "all" ? true : t.status === filter));

  if (tasksLoading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="skeleton" style={{ width: 120, height: 32, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 180, height: 16 }} />
          </div>
        </div>
        <TaskListSkeleton count={5} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">
            {tasks.length} total task{tasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setModalOpen(true)}
          style={{ width: "auto" }}
        >
          <Plus size={16} /> Create Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {(["all", "pending", "done"] as const).map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-secondary" : "btn-ghost"}`}
            onClick={() => setFilter(f)}
            style={{ width: "auto", textTransform: "capitalize" }}
          >
            {f}{" "}
            {f === "all"
              ? `(${tasks.length})`
              : f === "pending"
                ? `(${tasks.filter((t) => t.status === "pending").length})`
                : `(${tasks.filter((t) => t.status === "done").length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-title">No {filter !== "all" ? filter : ""} tasks</p>
          <p className="empty-state-desc">Create a task and assign it to an employee</p>
          <button
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
            style={{ width: "auto", marginTop: 16 }}
          >
            <Plus size={16} /> Create Task
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((task, i) => (
            <TaskCard key={task.id} task={task} index={i} />
          ))}
        </div>
      )}

      <TaskFormModal
        open={modalOpen}
        employees={activeEmployees}
        methods={methods}
        onSubmit={handleCreateTask}
        onClose={() => {
          setModalOpen(false);
          reset();
        }}
        isSubmitting={createTaskMutation.isPending}
      />
    </div>
  );
}
