export enum APIMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export enum APIBaseRoutes {
  OWNER = "/owner",
  EMPLOYEE = "/employee",
  CHAT = "/chat",
}

export interface APIDefinition<TRequest = unknown, TResponse = unknown> {
  method: APIMethod;
  baseUrl: APIBaseRoutes;
  subUrl: string;
  requestBody: TRequest;
  responseBody: TResponse;
  buildUrlPath: (...args: string[]) => string;
}
