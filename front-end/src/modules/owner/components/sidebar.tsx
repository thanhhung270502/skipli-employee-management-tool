"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout, getUser } from "@/common/lib";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  MessageSquare,
  LogOut,
  ChevronRight,
} from "lucide-react";

const ownerNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/employees", icon: Users, label: "Employees" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/chat", icon: MessageSquare, label: "Chat" },
];

const employeeNav = [
  { href: "/employee/tasks", icon: CheckSquare, label: "My Tasks" },
  { href: "/employee/profile", icon: Users, label: "Profile" },
  { href: "/employee/chat", icon: MessageSquare, label: "Chat" },
];

interface SidebarProps {
  role: "owner" | "employee";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const user = getUser();
  const nav = role === "owner" ? ownerNav : employeeNav;

  const displayName =
    role === "owner" ? "Manager" : user?.employee?.name ?? "Employee";

  const initials =
    role === "owner" ? "M" : (user?.employee?.name ?? "E")[0].toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
        <span className="sidebar-logo-text">Skipli</span>
      </div>

      <nav className="sidebar-section">
        <p className="sidebar-section-title">
          {role === "owner" ? "Manager" : "Employee"} Portal
        </p>
        {nav.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-nav-item ${
              pathname === href || pathname.startsWith(href + "/") ? "active" : ""
            }`}
          >
            <Icon size={18} />
            <span style={{ flex: 1 }}>{label}</span>
            {(pathname === href || pathname.startsWith(href + "/")) && (
              <ChevronRight size={14} style={{ opacity: 0.5 }} />
            )}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
            padding: "0 4px",
          }}
        >
          <div className="avatar avatar-sm" style={{ fontSize: 13 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayName}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {role === "owner" ? user?.phoneNumber : user?.employee?.email}
            </p>
          </div>
        </div>

        <button
          className="sidebar-nav-item"
          onClick={logout}
          style={{ width: "100%", color: "var(--danger)" }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
