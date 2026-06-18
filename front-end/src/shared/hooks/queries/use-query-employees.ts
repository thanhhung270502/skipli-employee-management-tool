"use client";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/common/lib";
import { API_GET_ALL_EMPLOYEES } from "@/common/models/employee";
import type { GetAllEmployeesResponse } from "@/common/models/employee";

export const EMPLOYEES_QUERY_KEY = ["employees"] as const;

export const useQueryEmployees = () =>
  useQuery<GetAllEmployeesResponse>({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<GetAllEmployeesResponse>(
        API_GET_ALL_EMPLOYEES.buildUrlPath()
      );
      return res.data ?? { employees: [] };
    },
  });
