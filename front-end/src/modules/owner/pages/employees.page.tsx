"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, X } from "lucide-react";
import {
  useQueryEmployees,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from "@/shared/hooks";
import { TableSkeleton } from "@/shared/components";
import type { EmployeeObject } from "@/common/models/employee";
import { useEmployeeForm } from "../hooks";
import { EmployeeFormModal, EmployeeTable } from "../components";

export function EmployeesPage() {
  const { data, isLoading } = useQueryEmployees();
  const employees = data?.employees ?? [];

  const createMutation = useCreateEmployeeMutation();
  const updateMutation = useUpdateEmployeeMutation();
  const deleteMutation = useDeleteEmployeeMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<EmployeeObject | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { methods, resetForAdd, resetForEdit } = useEmployeeForm();

  const openAddModal = () => {
    setEditEmployee(null);
    resetForAdd();
    setModalOpen(true);
  };

  const openEditModal = (emp: EmployeeObject) => {
    setEditEmployee(emp);
    resetForEdit(emp);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditEmployee(null);
  };

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      if (editEmployee) {
        await updateMutation.mutateAsync({ employeeId: editEmployee.id, ...data });
        toast.success("Employee updated!");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Employee created! Invite email sent.");
      }
      closeModal();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? "Operation failed");
    }
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Employee removed");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete employee");
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">
            {employees.length} team member{employees.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} style={{ width: "auto" }}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by name, email, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p className="empty-state-title">{search ? "No results found" : "No employees yet"}</p>
          <p className="empty-state-desc">
            {search ? "Try a different search term" : "Add your first employee to get started"}
          </p>
          {!search && (
            <button
              className="btn btn-primary"
              onClick={openAddModal}
              style={{ width: "auto", marginTop: 16 }}
            >
              <Plus size={16} /> Add Employee
            </button>
          )}
        </div>
      ) : (
        <EmployeeTable employees={filtered} onEdit={openEditModal} onDelete={setDeleteConfirm} />
      )}

      <EmployeeFormModal
        open={modalOpen}
        editEmployee={editEmployee}
        methods={methods}
        onSubmit={handleSubmit}
        onClose={closeModal}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setDeleteConfirm(null);
            }}
          >
            <motion.div
              className="modal"
              style={{ maxWidth: 380 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <h2 className="modal-title" style={{ marginBottom: 8 }}>
                  Delete Employee?
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
                  This action cannot be undone. The employee will lose access immediately.
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setDeleteConfirm(null)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={deleteMutation.isPending}
                    style={{ flex: 1 }}
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <span className="spinner" /> Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
