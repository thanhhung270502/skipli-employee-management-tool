"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { axiosInstance } from "@/common/lib";
import {
  API_EMPLOYEE_VERIFY_INVITE,
  API_EMPLOYEE_SETUP_ACCOUNT,
} from "@/common/models/auth";
import type {
  VerifyInviteResponse,
  SetupAccountResponse,
} from "@/common/models/auth";

// ─── Schema ──────────────────────────────────────────────
export const setupAccountSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SetupAccountFormData = z.infer<typeof setupAccountSchema>;

// ─── Hook ────────────────────────────────────────────────
export const useSetupAccount = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [employeeInfo, setEmployeeInfo] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const methods = useForm<SetupAccountFormData>({
    resolver: zodResolver(setupAccountSchema),
  });

  useEffect(() => {
    if (!token) {
      setError("Invalid invite link");
      setLoading(false);
      return;
    }
    axiosInstance
      .get<VerifyInviteResponse>(
        API_EMPLOYEE_VERIFY_INVITE.buildUrlPath(token)
      )
      .then((res) => {
        setEmployeeInfo({ name: res.data.name, email: res.data.email });
      })
      .catch((err: unknown) => {
        const e = err as { response?: { data?: { message?: string } } };
        setError(e.response?.data?.message ?? "Invalid or expired invite link");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      await axiosInstance.post<SetupAccountResponse>(
        API_EMPLOYEE_SETUP_ACCOUNT.buildUrlPath(),
        {
          inviteToken: token,
          username: data.username,
          password: data.password,
        }
      );
      toast.success("Account setup complete! Please log in.");
      router.push("/employee-login");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      methods.setError("root", {
        message: e.response?.data?.message ?? "Setup failed",
      });
    }
  });

  return {
    loading,
    error,
    employeeInfo,
    methods,
    onSubmit,
    isSubmitting: methods.formState.isSubmitting,
    rootError: methods.formState.errors.root?.message,
  };
};
