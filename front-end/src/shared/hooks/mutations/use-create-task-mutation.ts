"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/common/lib";
import { API_CREATE_TASK } from "@/common/models/task";
import type { CreateTaskRequest, CreateTaskResponse } from "@/common/models/task";
import { ALL_TASKS_QUERY_KEY } from "@/shared/hooks";

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<CreateTaskResponse, Error, CreateTaskRequest>({
    mutationFn: async (data) => {
      const res = await axiosInstance.post<CreateTaskResponse>(
        API_CREATE_TASK.buildUrlPath(),
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALL_TASKS_QUERY_KEY });
    },
  });
};
