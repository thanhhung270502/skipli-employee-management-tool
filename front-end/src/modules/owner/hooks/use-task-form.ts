"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// ─── Schema ──────────────────────────────────────────────
export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assignedTo: z.string().min(1, "Please assign to an employee"),
  dueDate: z.string().optional(),
});
export type TaskFormData = z.infer<typeof taskFormSchema>;

const EMPTY_FORM: TaskFormData = {
  title: "",
  description: "",
  assignedTo: "",
  dueDate: "",
};

// ─── Hook ────────────────────────────────────────────────
export const useTaskForm = () => {
  const methods = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const reset = () => methods.reset(EMPTY_FORM);

  return { methods, reset, isSubmitting: methods.formState.isSubmitting };
};
