"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";
import type { EmployeeObject } from "@/common/models/employee";

interface EmployeeTableProps {
  employees: EmployeeObject[];
  onEdit: (emp: EmployeeObject) => void;
  onDelete: (id: string) => void;
}

export function EmployeeTable({ employees, onEdit, onDelete }: EmployeeTableProps) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Role</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <motion.tr
              key={emp.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="avatar avatar-sm">
                    {emp.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600 }}>{emp.name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {emp.email}
                    </p>
                  </div>
                </div>
              </td>
              <td>{emp.department}</td>
              <td>
                <span className="badge badge-purple">{emp.role}</span>
              </td>
              <td>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {emp.phone ?? "—"}
                </p>
              </td>
              <td>
                <span
                  className={`badge ${emp.isSetup ? "badge-success" : "badge-warning"}`}
                >
                  {emp.isSetup ? "✓ Active" : "⏳ Pending"}
                </span>
              </td>
              <td>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => onEdit(emp)}
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn btn-danger btn-sm btn-icon"
                    onClick={() => onDelete(emp.id)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
