"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/common/lib";
import { API_DELETE_EMPLOYEE } from "@/common/models/employee";
import type { DeleteEmployeeResponse } from "@/common/models/employee";
import { EMPLOYEES_QUERY_KEY } from "@/shared/hooks";

export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<DeleteEmployeeResponse, Error, string>({
    mutationFn: async (employeeId) => {
      const res = await axiosInstance.delete<DeleteEmployeeResponse>(
        API_DELETE_EMPLOYEE.buildUrlPath(employeeId)
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    },
  });
};
