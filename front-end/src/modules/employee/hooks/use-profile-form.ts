"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { axiosInstance, getUser, setUser } from "@/common/lib";
import { API_GET_PROFILE } from "@/common/models/employee";
import type { GetProfileResponse } from "@/common/models/employee";
import toast from "react-hot-toast";
import { useState } from "react";
import { useUpdateProfileMutation } from "@/shared/hooks/mutations";

// ─── Schema ──────────────────────────────────────────────
export const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email").or(z.literal("")),
  phone: z.string().optional(),
});
export type ProfileFormData = z.infer<typeof profileFormSchema>;

// ─── Hook ────────────────────────────────────────────────
export const useProfileForm = () => {
  const [profile, setProfile] = useState<GetProfileResponse["employee"] | null>(null);
  const [loading, setLoading] = useState(true);
  const updateMutation = useUpdateProfileMutation();

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  useEffect(() => {
    axiosInstance
      .get<GetProfileResponse>(API_GET_PROFILE.buildUrlPath())
      .then((res) => {
        const emp = res.data?.employee;
        setProfile(emp);
        methods.reset({
          name: emp?.name ?? "",
          phone: emp?.phone ?? "",
          email: emp?.email ?? "",
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      await updateMutation.mutateAsync(data);
      toast.success("Profile updated!");
      methods.reset(data);

      // Update localStorage
      const user = getUser();
      if (user?.employee) {
        setUser({ ...user, employee: { ...user.employee, name: data.name, email: data.email } });
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? "Failed to update profile");
    }
  });

  return {
    profile,
    loading,
    methods,
    onSubmit,
    isSaving: updateMutation.isPending,
    isDirty: methods.formState.isDirty,
  };
};
