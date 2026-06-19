"use client";
import { motion } from "framer-motion";
import { Users, CheckSquare, Clock, TrendingUp } from "lucide-react";
import { useQueryEmployees, useQueryAllTasks } from "@/shared/hooks";
import { DashboardSkeleton } from "@/shared/components";
import { StatCard } from "../components";

export function DashboardPage() {
  const { data: empData, isLoading: empLoading } = useQueryEmployees();
  const { data: taskData, isLoading: taskLoading } = useQueryAllTasks();

  const loading = empLoading || taskLoading;
  const employees = empData?.employees ?? [];
  const tasks = taskData?.tasks ?? [];

  const stats = {
    totalEmployees: employees.length,
    totalTasks: tasks.length,
    pendingTasks: tasks.filter((t) => t.status === "pending").length,
    doneTasks: tasks.filter((t) => t.status === "done").length,
  };

  const statCards = [
    {
      icon: Users,
      label: "Total Employees",
      value: stats.totalEmployees,
      colorClass: "stat-icon-purple",
    },
    {
      icon: CheckSquare,
      label: "Total Tasks",
      value: stats.totalTasks,
      colorClass: "stat-icon-blue",
    },
    {
      icon: Clock,
      label: "Pending Tasks",
      value: stats.pendingTasks,
      colorClass: "stat-icon-yellow",
    },
    { icon: TrendingUp, label: "Completed", value: stats.doneTasks, colorClass: "stat-icon-green" },
  ];

  const recentTasks = tasks.slice(0, 5);
  const recentEmployees = employees.slice(0, 5);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
      </div>

      <motion.div
        className="grid-4"
        style={{ marginBottom: 32 }}
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
      >
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </motion.div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Tasks</span>
            <a href="/tasks" style={{ fontSize: 13, color: "var(--accent-primary)" }}>
              View all →
            </a>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 0" }}>
              <div className="empty-state-icon">📋</div>
              <p className="empty-state-title">No tasks yet</p>
              <p className="empty-state-desc">Create your first task for an employee</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {task.title}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {task.assignedToName}
                    </p>
                  </div>
                  <span
                    className={`badge ${task.status === "done" ? "badge-success" : "badge-warning"}`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Employees</span>
            <a href="/employees" style={{ fontSize: 13, color: "var(--accent-primary)" }}>
              View all →
            </a>
          </div>
          {recentEmployees.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 0" }}>
              <div className="empty-state-icon">👥</div>
              <p className="empty-state-title">No employees yet</p>
              <p className="empty-state-desc">Add your first team member</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {recentEmployees.map((emp) => (
                <div
                  key={emp.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="avatar avatar-sm">{emp.name[0].toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                      {emp.name}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{emp.department}</p>
                  </div>
                  <span className={`badge ${emp.isSetup ? "badge-success" : "badge-warning"}`}>
                    {emp.isSetup ? "Active" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
