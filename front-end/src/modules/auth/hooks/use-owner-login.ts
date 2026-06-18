"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { axiosInstance, setUser, isLoggedIn, isOwner } from "@/common/lib";
import {
  API_OWNER_CREATE_CODE,
  API_OWNER_VALIDATE_CODE,
} from "@/common/models/auth";
import type {
  OwnerCreateCodeResponse,
  OwnerValidateCodeResponse,
} from "@/common/models/auth";
import type { EUserRole } from "@/common/models/auth";

// ─── Schemas ────────────────────────────────────────────
export const ownerPhoneSchema = z.object({
  phoneNumber: z.string().min(1, "Please enter your phone number"),
});
export type OwnerPhoneFormData = z.infer<typeof ownerPhoneSchema>;

export const ownerOtpSchema = z.object({
  otp: z.array(z.string()).length(6),
});
export type OwnerOtpFormData = z.infer<typeof ownerOtpSchema>;

// ─── Hook ────────────────────────────────────────────────
export const useOwnerLogin = () => {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phoneMethods = useForm<OwnerPhoneFormData>({
    resolver: zodResolver(ownerPhoneSchema),
  });

  useEffect(() => {
    if (isLoggedIn() && isOwner()) router.replace("/dashboard");
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleSendOtp = phoneMethods.handleSubmit(async (data) => {
    setError("");
    setLoading(true);
    try {
      await axiosInstance.post<OwnerCreateCodeResponse>(
        API_OWNER_CREATE_CODE.buildUrlPath(),
        { phoneNumber: data.phoneNumber },
      );
      setPhoneNumber(data.phoneNumber);
      toast.success("OTP sent to your phone!");
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
      const res = await axiosInstance.post<OwnerValidateCodeResponse>(
        API_OWNER_VALIDATE_CODE.buildUrlPath(),
        { phoneNumber, accessCode: code },
      );
      const { token, role } = res.data;
      setUser({ token, role: role as EUserRole, phoneNumber });
      toast.success("Welcome back, Manager!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Invalid access code");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep("phone");
    setOtp(["", "", "", "", "", ""]);
    setError("");
  };

  return {
    step,
    loading,
    error,
    countdown,
    otp,
    phoneNumber,
    otpRefs,
    phoneMethods,
    handleSendOtp,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleValidateOtp,
    goBack,
  };
};
