"use client";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { FormProvider } from "react-hook-form";
import { useSetupAccount } from "../hooks";

function SetupAccountContent() {
  const {
    loading,
    error,
    employeeInfo,
    methods,
    onSubmit,
    isSubmitting,
    rootError,
  } = useSetupAccount();

  if (loading) {
    return (
      <div className="auth-page">
        <div className="page-loading">
          <div className="spinner spinner-primary" />
          <span>Verifying invite link...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <span className="auth-logo-text">Skipli</span>
        </div>

        {error && !employeeInfo ? (
          <div>
            <h1 className="auth-title">Invalid Link</h1>
            <div className="alert alert-error">{error}</div>
            <a
              href="/employee-login"
              className="btn btn-primary"
              style={{ marginTop: 16 }}
            >
              Go to Login
            </a>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  background: "var(--success-bg)",
                  borderRadius: 100,
                  marginBottom: 16,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--success)",
                }}
              >
                ✓ Invite Verified
              </div>
              <h1 className="auth-title">Set Up Your Account</h1>
              <p className="auth-subtitle">
                Welcome,{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  {employeeInfo?.name}
                </strong>
                ! Create your login credentials.
              </p>
            </div>

            <FormProvider {...methods}>
              <form onSubmit={onSubmit}>
                {(rootError || error) && (
                  <div className="alert alert-error">{rootError ?? error}</div>
                )}

                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Choose a username"
                    autoFocus
                    {...methods.register("username")}
                  />
                  {methods.formState.errors.username && (
                    <p className="form-hint" style={{ color: "var(--danger)" }}>
                      {methods.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="At least 8 characters"
                    {...methods.register("password")}
                  />
                  {methods.formState.errors.password && (
                    <p className="form-hint" style={{ color: "var(--danger)" }}>
                      {methods.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Repeat your password"
                    {...methods.register("confirmPassword")}
                  />
                  {methods.formState.errors.confirmPassword && (
                    <p className="form-hint" style={{ color: "var(--danger)" }}>
                      {methods.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" /> Setting up...
                    </>
                  ) : (
                    "Complete Setup →"
                  )}
                </button>
              </form>
            </FormProvider>
          </>
        )}
      </motion.div>
    </div>
  );
}

export function SetupAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="page-loading">
          <div className="spinner spinner-primary" />
        </div>
      }
    >
      <SetupAccountContent />
    </Suspense>
  );
}
