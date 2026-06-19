"use client";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/common/lib";
import { API_GET_ALL_TASKS, API_GET_MY_TASKS } from "@/common/models/task";
import type { GetAllTasksResponse, GetMyTasksResponse } from "@/common/models/task";

export const ALL_TASKS_QUERY_KEY = ["tasks", "all"] as const;
export const MY_TASKS_QUERY_KEY = ["tasks", "mine"] as const;

const TASK_POLL_INTERVAL_MS = 5000;

export const useQueryAllTasks = () =>
  useQuery<GetAllTasksResponse>({
    queryKey: ALL_TASKS_QUERY_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<GetAllTasksResponse>(API_GET_ALL_TASKS.buildUrlPath());
      return res.data ?? { tasks: [] };
    },
    refetchInterval: TASK_POLL_INTERVAL_MS,
  });

export const useQueryMyTasks = () =>
  useQuery<GetMyTasksResponse>({
    queryKey: MY_TASKS_QUERY_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<GetMyTasksResponse>(API_GET_MY_TASKS.buildUrlPath());
      return res.data ?? { tasks: [] };
    },
    refetchInterval: TASK_POLL_INTERVAL_MS,
  });
