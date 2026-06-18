import type { APIDefinition } from "@/common/types";
import { APIMethod, APIBaseRoutes } from "@/common/types";
import type { GetMessagesResponse } from "./chat-model";

export const API_GET_MESSAGES: APIDefinition<undefined, GetMessagesResponse> = {
  method: APIMethod.GET,
  baseUrl: APIBaseRoutes.CHAT,
  subUrl: "/:roomId/messages",
  requestBody: undefined,
  responseBody: {} as GetMessagesResponse,
  buildUrlPath: (roomId: string, limit = "50") =>
    `${APIBaseRoutes.CHAT}/${roomId}/messages?limit=${limit}`,
};
