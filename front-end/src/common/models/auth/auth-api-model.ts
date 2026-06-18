import type { APIDefinition } from "@/common/types";
import { APIMethod, APIBaseRoutes } from "@/common/types";
import type {
  OwnerCreateCodeRequest,
  OwnerCreateCodeResponse,
  OwnerValidateCodeRequest,
  OwnerValidateCodeResponse,
  EmployeeLoginEmailRequest,
  EmployeeLoginEmailResponse,
  EmployeeValidateCodeRequest,
  EmployeeValidateCodeResponse,
  VerifyInviteResponse,
  SetupAccountRequest,
  SetupAccountResponse,
} from "./auth-model";

export const API_OWNER_CREATE_CODE: APIDefinition<
  OwnerCreateCodeRequest,
  OwnerCreateCodeResponse
> = {
  method: APIMethod.POST,
  baseUrl: APIBaseRoutes.OWNER,
  subUrl: "/create-new-access-code",
  requestBody: {} as OwnerCreateCodeRequest,
  responseBody: {} as OwnerCreateCodeResponse,
  buildUrlPath: () => `${APIBaseRoutes.OWNER}/create-new-access-code`,
};

export const API_OWNER_VALIDATE_CODE: APIDefinition<
  OwnerValidateCodeRequest,
  OwnerValidateCodeResponse
> = {
  method: APIMethod.POST,
  baseUrl: APIBaseRoutes.OWNER,
  subUrl: "/validate-access-code",
  requestBody: {} as OwnerValidateCodeRequest,
  responseBody: {} as OwnerValidateCodeResponse,
  buildUrlPath: () => `${APIBaseRoutes.OWNER}/validate-access-code`,
};

export const API_EMPLOYEE_LOGIN_EMAIL: APIDefinition<
  EmployeeLoginEmailRequest,
  EmployeeLoginEmailResponse
> = {
  method: APIMethod.POST,
  baseUrl: APIBaseRoutes.EMPLOYEE,
  subUrl: "/login-email",
  requestBody: {} as EmployeeLoginEmailRequest,
  responseBody: {} as EmployeeLoginEmailResponse,
  buildUrlPath: () => `${APIBaseRoutes.EMPLOYEE}/login-email`,
};

export const API_EMPLOYEE_VALIDATE_CODE: APIDefinition<
  EmployeeValidateCodeRequest,
  EmployeeValidateCodeResponse
> = {
  method: APIMethod.POST,
  baseUrl: APIBaseRoutes.EMPLOYEE,
  subUrl: "/validate-access-code",
  requestBody: {} as EmployeeValidateCodeRequest,
  responseBody: {} as EmployeeValidateCodeResponse,
  buildUrlPath: () => `${APIBaseRoutes.EMPLOYEE}/validate-access-code`,
};

export const API_EMPLOYEE_VERIFY_INVITE: APIDefinition<
  undefined,
  VerifyInviteResponse
> = {
  method: APIMethod.GET,
  baseUrl: APIBaseRoutes.EMPLOYEE,
  subUrl: "/verify-invite/:token",
  requestBody: undefined,
  responseBody: {} as VerifyInviteResponse,
  buildUrlPath: (token: string) =>
    `${APIBaseRoutes.EMPLOYEE}/verify-invite/${token}`,
};

export const API_EMPLOYEE_SETUP_ACCOUNT: APIDefinition<
  SetupAccountRequest,
  SetupAccountResponse
> = {
  method: APIMethod.POST,
  baseUrl: APIBaseRoutes.EMPLOYEE,
  subUrl: "/setup-account",
  requestBody: {} as SetupAccountRequest,
  responseBody: {} as SetupAccountResponse,
  buildUrlPath: () => `${APIBaseRoutes.EMPLOYEE}/setup-account`,
};
