"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { axiosInstance, setUser, isLoggedIn, isEmployee } from "@/common/lib";
import {
  API_EMPLOYEE_LOGIN_EMAIL,
  API_EMPLOYEE_VALIDATE_CODE,
} from "@/common/models/auth";
import type {
  EmployeeLoginEmailResponse,
  EmployeeValidateCodeResponse,
  EUserRole,
} from "@/common/models/auth";

// ─── Schemas ────────────────────────────────────────────
export const employeeEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
export type EmployeeEmailFormData = z.infer<typeof employeeEmailSchema>;

// ─── Hook ────────────────────────────────────────────────
export const useEmployeeLogin = () => {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmailState] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const emailMethods = useForm<EmployeeEmailFormData>({
    resolver: zodResolver(employeeEmailSchema),
  });

  useEffect(() => {
    if (isLoggedIn() && isEmployee()) router.replace("/employee/tasks");
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleSendOtp = emailMethods.handleSubmit(async (data) => {
    setError("");
    setLoading(true);
    try {
      await axiosInstance.post<EmployeeLoginEmailResponse>(
        API_EMPLOYEE_LOGIN_EMAIL.buildUrlPath(),
        { email: data.email },
      );
      setEmailState(data.email);
      toast.success("OTP sent to your email!");
      setStep("otp");
      setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleValidateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.post<EmployeeValidateCodeResponse>(
        API_EMPLOYEE_VALIDATE_CODE.buildUrlPath(),
        { email, accessCode: code },
      );
      const { token, role, employee } = res.data;
      setUser({ token, role: role as EUserRole, email, employee });
      toast.success(`Welcome back, ${employee.name}!`);
      router.push("/employee/tasks");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Invalid access code");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep("email");
    setOtp(["", "", "", "", "", ""]);
    setError("");
  };

  return {
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
  };
};
