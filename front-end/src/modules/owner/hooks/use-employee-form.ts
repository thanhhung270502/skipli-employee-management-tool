"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { EmployeeObject } from "@/common/models/employee";

// ─── Schema ──────────────────────────────────────────────
export const employeeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  role: z.string().optional(),
});
export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

const EMPTY_FORM: EmployeeFormData = {
  name: "",
  email: "",
  phone: "",
  department: "",
  role: "Employee",
};

// ─── Hook ────────────────────────────────────────────────
export const useEmployeeForm = () => {
  const methods = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const resetForAdd = () => {
    methods.reset(EMPTY_FORM);
  };

  const resetForEdit = (emp: EmployeeObject) => {
    methods.reset({
      name: emp.name,
      email: emp.email,
      phone: emp.phone ?? "",
      department: emp.department,
      role: emp.role,
    });
  };

  return { methods, resetForAdd, resetForEdit };
};
