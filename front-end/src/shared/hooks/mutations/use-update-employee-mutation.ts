"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/common/lib";
import { API_UPDATE_EMPLOYEE } from "@/common/models/employee";
import type { UpdateEmployeeRequest, UpdateEmployeeResponse } from "@/common/models/employee";
import { EMPLOYEES_QUERY_KEY } from "@/shared/hooks";

export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<UpdateEmployeeResponse, Error, UpdateEmployeeRequest>({
    mutationFn: async ({ employeeId, ...data }) => {
      const res = await axiosInstance.put<UpdateEmployeeResponse>(
        API_UPDATE_EMPLOYEE.buildUrlPath(employeeId),
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    },
  });
};
