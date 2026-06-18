export enum EUserRole {
  OWNER = "owner",
  EMPLOYEE = "employee",
}

export interface EmployeeObject {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

export interface UserObject {
  phoneNumber?: string;
  email?: string;
  role: EUserRole;
  token: string;
  employee?: EmployeeObject;
}

// ─── Owner Auth ──────────────────────────────────────────
export interface OwnerCreateCodeRequest {
  phoneNumber: string;
}
export interface OwnerCreateCodeResponse {
  message: string;
}

export interface OwnerValidateCodeRequest {
  phoneNumber: string;
  accessCode: string;
}
export interface OwnerValidateCodeResponse {
  token: string;
  role: EUserRole;
}

// ─── Employee Auth ────────────────────────────────────────
export interface EmployeeLoginEmailRequest {
  email: string;
}
export interface EmployeeLoginEmailResponse {
  message: string;
}

export interface EmployeeValidateCodeRequest {
  email: string;
  accessCode: string;
}
export interface EmployeeValidateCodeResponse {
  token: string;
  role: EUserRole;
  employee: EmployeeObject;
}

export interface VerifyInviteResponse {
  name: string;
  email: string;
}

export interface SetupAccountRequest {
  inviteToken: string;
  username: string;
  password: string;
}
export interface SetupAccountResponse {
  message: string;
}
