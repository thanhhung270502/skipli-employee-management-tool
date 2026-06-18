"use client";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/common/lib";
import { API_UPDATE_PROFILE } from "@/common/models/employee";
import type {
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "@/common/models/employee";

export const useUpdateProfileMutation = () =>
  useMutation<UpdateProfileResponse, Error, UpdateProfileRequest>({
    mutationFn: async (data) => {
      const res = await axiosInstance.put<UpdateProfileResponse>(
        API_UPDATE_PROFILE.buildUrlPath(),
        data
      );
      return res.data;
    },
  });
