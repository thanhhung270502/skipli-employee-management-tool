import type { APIDefinition } from "@/common/types";
import { APIMethod, APIBaseRoutes } from "@/common/types";
import type {
  CreateTaskRequest,
  CreateTaskResponse,
  GetAllTasksResponse,
  GetMyTasksResponse,
  MarkTaskDoneResponse,
} from "./task-model";

export const API_GET_ALL_TASKS: APIDefinition<undefined, GetAllTasksResponse> = {
  method: APIMethod.GET,
  baseUrl: APIBaseRoutes.OWNER,
  subUrl: "/tasks",
  requestBody: undefined,
  responseBody: {} as GetAllTasksResponse,
  buildUrlPath: () => `${APIBaseRoutes.OWNER}/tasks`,
};

export const API_CREATE_TASK: APIDefinition<
  CreateTaskRequest,
  CreateTaskResponse
> = {
  method: APIMethod.POST,
  baseUrl: APIBaseRoutes.OWNER,
  subUrl: "/tasks",
  requestBody: {} as CreateTaskRequest,
  responseBody: {} as CreateTaskResponse,
  buildUrlPath: () => `${APIBaseRoutes.OWNER}/tasks`,
};

export const API_GET_MY_TASKS: APIDefinition<undefined, GetMyTasksResponse> = {
  method: APIMethod.GET,
  baseUrl: APIBaseRoutes.EMPLOYEE,
  subUrl: "/tasks",
  requestBody: undefined,
  responseBody: {} as GetMyTasksResponse,
  buildUrlPath: () => `${APIBaseRoutes.EMPLOYEE}/tasks`,
};

export const API_MARK_TASK_DONE: APIDefinition<
  undefined,
  MarkTaskDoneResponse
> = {
  method: APIMethod.PUT,
  baseUrl: APIBaseRoutes.EMPLOYEE,
  subUrl: "/tasks/:taskId/done",
  requestBody: undefined,
  responseBody: {} as MarkTaskDoneResponse,
  buildUrlPath: (id: string) => `${APIBaseRoutes.EMPLOYEE}/tasks/${id}/done`,
};
