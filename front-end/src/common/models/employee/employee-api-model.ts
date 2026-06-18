import type { APIDefinition } from "@/common/types";
import { APIMethod, APIBaseRoutes } from "@/common/types";
import type {
  GetAllEmployeesResponse,
  GetEmployeeResponse,
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
  DeleteEmployeeResponse,
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "./employee-model";

export const API_GET_ALL_EMPLOYEES: APIDefinition<
  undefined,
  GetAllEmployeesResponse
> = {
  method: APIMethod.GET,
  baseUrl: APIBaseRoutes.OWNER,
  subUrl: "/employees",
  requestBody: undefined,
  responseBody: {} as GetAllEmployeesResponse,
  buildUrlPath: () => `${APIBaseRoutes.OWNER}/employees`,
};

export const API_GET_EMPLOYEE: APIDefinition<
  { employeeId: string },
  GetEmployeeResponse
> = {
  method: APIMethod.GET,
  baseUrl: APIBaseRoutes.OWNER,
  subUrl: "/employees/:employeeId",
  requestBody: {} as { employeeId: string },
  responseBody: {} as GetEmployeeResponse,
  buildUrlPath: (id: string) => `${APIBaseRoutes.OWNER}/employees/${id}`,
};

export const API_CREATE_EMPLOYEE: APIDefinition<
  CreateEmployeeRequest,
  CreateEmployeeResponse
> = {
  method: APIMethod.POST,
  baseUrl: APIBaseRoutes.OWNER,
  subUrl: "/employees",
  requestBody: {} as CreateEmployeeRequest,
  responseBody: {} as CreateEmployeeResponse,
  buildUrlPath: () => `${APIBaseRoutes.OWNER}/employees`,
};

export const API_UPDATE_EMPLOYEE: APIDefinition<
  UpdateEmployeeRequest,
  UpdateEmployeeResponse
> = {
  method: APIMethod.PUT,
  baseUrl: APIBaseRoutes.OWNER,
  subUrl: "/employees/:employeeId",
  requestBody: {} as UpdateEmployeeRequest,
  responseBody: {} as UpdateEmployeeResponse,
  buildUrlPath: (id: string) => `${APIBaseRoutes.OWNER}/employees/${id}`,
};

export const API_DELETE_EMPLOYEE: APIDefinition<
  { employeeId: string },
  DeleteEmployeeResponse
> = {
  method: APIMethod.DELETE,
  baseUrl: APIBaseRoutes.OWNER,
  subUrl: "/employees/:employeeId",
  requestBody: {} as { employeeId: string },
  responseBody: {} as DeleteEmployeeResponse,
  buildUrlPath: (id: string) => `${APIBaseRoutes.OWNER}/employees/${id}`,
};

export const API_GET_PROFILE: APIDefinition<undefined, GetProfileResponse> = {
  method: APIMethod.GET,
  baseUrl: APIBaseRoutes.EMPLOYEE,
  subUrl: "/profile",
  requestBody: undefined,
  responseBody: {} as GetProfileResponse,
  buildUrlPath: () => `${APIBaseRoutes.EMPLOYEE}/profile`,
};

export const API_UPDATE_PROFILE: APIDefinition<
  UpdateProfileRequest,
  UpdateProfileResponse
> = {
  method: APIMethod.PUT,
  baseUrl: APIBaseRoutes.EMPLOYEE,
  subUrl: "/profile",
  requestBody: {} as UpdateProfileRequest,
  responseBody: {} as UpdateProfileResponse,
  buildUrlPath: () => `${APIBaseRoutes.EMPLOYEE}/profile`,
};
