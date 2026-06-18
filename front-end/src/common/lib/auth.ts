import type { UserObject } from "@/common/models/auth";

export const getUser = (): UserObject | null => {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setUser = (user: UserObject): void => {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", user.token);
};

export const clearUser = (): void => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

export const isLoggedIn = (): boolean => !!getUser();

export const isOwner = (): boolean => getUser()?.role === "owner";

export const isEmployee = (): boolean => getUser()?.role === "employee";

export const logout = (): void => {
  clearUser();
  window.location.href = "/login";
};
