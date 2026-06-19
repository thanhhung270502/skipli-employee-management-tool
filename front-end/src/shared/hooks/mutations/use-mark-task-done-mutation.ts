"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/common/lib";
import { API_MARK_TASK_DONE } from "@/common/models/task";
import type { MarkTaskDoneResponse } from "@/common/models/task";
import { MY_TASKS_QUERY_KEY, ALL_TASKS_QUERY_KEY } from "@/shared/hooks";

export const useMarkTaskDoneMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<MarkTaskDoneResponse, Error, string>({
    mutationFn: async (taskId) => {
      const res = await axiosInstance.put<MarkTaskDoneResponse>(
        API_MARK_TASK_DONE.buildUrlPath(taskId),
        {}
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_TASKS_QUERY_KEY });
    },
  });
};
