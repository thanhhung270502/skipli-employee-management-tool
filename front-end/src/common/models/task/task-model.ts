export enum ETaskStatus {
  PENDING = "pending",
  DONE = "done",
}

export interface TaskObject {
  id: string;
  title: string;
  description: string | null;
  assignedTo: string;
  assignedToName: string;
  status: ETaskStatus;
  dueDate: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assignedTo: string;
  dueDate?: string;
}
export interface CreateTaskResponse {
  message: string;
  task: TaskObject;
}

export interface GetAllTasksResponse {
  tasks: TaskObject[];
}

export interface GetMyTasksResponse {
  tasks: TaskObject[];
}

export interface MarkTaskDoneResponse {
  message: string;
  task: TaskObject;
}
