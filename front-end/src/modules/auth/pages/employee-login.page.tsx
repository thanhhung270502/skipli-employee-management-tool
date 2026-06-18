"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FormProvider } from "react-hook-form";
import { useEmployeeLogin } from "../hooks";
import { OtpInput } from "../components";

export function EmployeeLoginPage() {
  const {
    step,
    loading,
    error,
    countdown,
    otp,
    email,
    otpRefs,
    emailMethods,
    handleSendOtp,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleValidateOtp,
    goBack,
  } = useEmployeeLogin();

  return (
    <div className="auth-page">
      <div
        className="auth-bg-orb auth-bg-orb-1"
        style={{ background: "rgba(139, 92, 246, 0.12)" }}
      />
      <div
        className="auth-bg-orb auth-bg-orb-2"
        style={{ background: "rgba(99, 102, 241, 0.08)" }}
      />

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

        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="auth-title">Employee Login</h1>
              <p className="auth-subtitle">
                Enter your work email to receive an access code
              </p>

              <FormProvider {...emailMethods}>
                <form onSubmit={handleSendOtp}>
                  {error && <div className="alert alert-error">{error}</div>}
                  <div className="form-group">
                    <label className="form-label">Work Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="you@company.com"
                      autoFocus
                      {...emailMethods.register("email")}
                    />
                    {emailMethods.formState.errors.email && (
                      <p className="form-hint" style={{ color: "var(--danger)" }}>
                        {emailMethods.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" /> Sending...
                      </>
                    ) : (
                      "Send Access Code →"
                    )}
                  </button>
                </form>
              </FormProvider>

              <div className="divider-text" style={{ marginTop: 24 }}>
                <span>Manager?</span>
              </div>
              <a
                href="/login"
                className="btn btn-ghost w-full"
                style={{ marginTop: 8, textAlign: "center" }}
              >
                Login as Manager
              </a>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={goBack}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  fontSize: 13,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                ← Back
              </button>
              <h1 className="auth-title">Check Your Email</h1>
              <p className="auth-subtitle">
                We sent a code to{" "}
                <strong style={{ color: "var(--text-primary)" }}>{email}</strong>
              </p>

              <form onSubmit={handleValidateOtp}>
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <OtpInput
                    otp={otp}
                    onChange={handleOtpChange}
                    onKeyDown={handleOtpKeyDown}
                    onPaste={handleOtpPaste}
                    inputRefs={otpRefs}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner" /> Verifying...
                    </>
                  ) : (
                    "Login →"
                  )}
                </button>

                <div style={{ textAlign: "center", marginTop: 20 }}>
                  {countdown > 0 ? (
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      Resend in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--accent-primary)",
                        fontSize: 13,
                      }}
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
