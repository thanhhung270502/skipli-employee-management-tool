"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/common/lib";
import { API_CREATE_EMPLOYEE } from "@/common/models/employee";
import type { CreateEmployeeRequest, CreateEmployeeResponse } from "@/common/models/employee";
import { EMPLOYEES_QUERY_KEY } from "@/shared/hooks";

export const useCreateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<CreateEmployeeResponse, Error, CreateEmployeeRequest>({
    mutationFn: async (data) => {
      const res = await axiosInstance.post<CreateEmployeeResponse>(
        API_CREATE_EMPLOYEE.buildUrlPath(),
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    },
  });
};
