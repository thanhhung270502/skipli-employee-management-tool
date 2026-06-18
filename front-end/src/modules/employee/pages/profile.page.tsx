"use client";
import { motion } from "framer-motion";
import { FormProvider } from "react-hook-form";
import { User, Mail, Phone, Save } from "lucide-react";
import { useProfileForm } from "../hooks";

export function EmployeeProfilePage() {
  const { profile, loading, methods, onSubmit, isSaving, isDirty } =
    useProfileForm();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner spinner-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information</p>
        </div>
      </div>

      <div style={{ maxWidth: 600 }}>
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}
        >
          <div className="avatar avatar-lg" style={{ fontSize: 28 }}>
            {profile?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
              {profile?.name}
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              {profile?.role} · {profile?.department}
            </p>
            <span
              className={`badge ${profile?.isSetup ? "badge-success" : "badge-warning"}`}
              style={{ marginTop: 8 }}
            >
              {profile?.isSetup ? "✓ Active Account" : "Pending Setup"}
            </span>
          </div>
        </motion.div>

        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-header">
            <span className="card-title">Edit Information</span>
            {isDirty && (
              <span className="badge badge-warning">Unsaved changes</span>
            )}
          </div>

          <FormProvider {...methods}>
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <User size={12} style={{ display: "inline", marginRight: 4 }} />
                  Full Name
                </label>
                <input
                  className="form-input"
                  {...methods.register("name")}
                />
                {methods.formState.errors.name && (
                  <p className="form-hint" style={{ color: "var(--danger)" }}>
                    {methods.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={12} style={{ display: "inline", marginRight: 4 }} />
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  {...methods.register("email")}
                />
                {methods.formState.errors.email && (
                  <p className="form-hint" style={{ color: "var(--danger)" }}>
                    {methods.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={12} style={{ display: "inline", marginRight: 4 }} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 234 567 8900"
                  {...methods.register("phone")}
                />
              </div>

              <hr className="divider" />

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    className="form-input"
                    value={profile?.department ?? ""}
                    disabled
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Role</label>
                  <input
                    className="form-input"
                    value={profile?.role ?? ""}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <p className="form-hint" style={{ marginBottom: 20 }}>
                Department and role can only be changed by your manager.
              </p>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving || !isDirty}
                style={{ width: "auto" }}
              >
                {isSaving ? (
                  <>
                    <span className="spinner" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Changes
                  </>
                )}
              </button>
            </form>
          </FormProvider>
        </motion.div>
      </div>
    </div>
  );
}
