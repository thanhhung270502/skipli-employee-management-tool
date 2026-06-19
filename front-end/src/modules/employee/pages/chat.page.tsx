"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import {
  axiosInstance,
  getUser,
  connectSocket,
  disconnectSocket,
} from "@/common/lib";
import { API_GET_MESSAGES } from "@/common/models/chat";
import type { MessageObject, GetMessagesResponse } from "@/common/models/chat";
import { logger } from "@/shared/libs";

export function EmployeeChatPage() {
  const [messages, setMessages] = useState<MessageObject[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const user = getUser();

  const employeeId = user?.employee?.id ?? "";
  const roomId = `manager_${employeeId}`;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!employeeId) return;

    axiosInstance
      .get<GetMessagesResponse>(API_GET_MESSAGES.buildUrlPath(roomId))
      .then((res) => setMessages(res.data?.messages ?? []))
      .catch(logger.error)
      .finally(() => setLoading(false));

    const socket = connectSocket(user?.token ?? "");

    socket.emit("join_room", {
      roomId,
      userId: employeeId,
      role: "employee",
      name: user?.employee?.name ?? "Employee",
    });

    socket.on("room_joined", () => setConnected(true));

    socket.on("receive_message", (msg: MessageObject) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("user_typing", () => setIsTyping(true));
    socket.on("user_stopped_typing", () => setIsTyping(false));

    return () => {
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const socket = connectSocket(user?.token ?? "");

    socket.emit("send_message", {
      roomId,
      senderId: employeeId,
      senderName: user?.employee?.name ?? "Employee",
      senderRole: "employee",
      text: newMessage.trim(),
    });

    setNewMessage("");
    socket.emit("typing_stop", { roomId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    const socket = connectSocket(user?.token ?? "");
    socket.emit("typing_start", {
      roomId,
      senderName: user?.employee?.name ?? "Employee",
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { roomId });
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getTimestamp = (ts: unknown): string => {
    if (!ts) return "";
    let date: Date | null = null;
    if (ts instanceof Date) {
      date = isNaN(ts.getTime()) ? null : ts;
    } else if (typeof ts === "object") {
      const t = ts as { _seconds?: number; seconds?: number; toDate?: () => Date };
      if (typeof t.toDate === "function") {
        try {
          const d = t.toDate();
          if (!isNaN(d.getTime())) date = d;
        } catch {
          // ignore
        }
      }
      if (!date) {
        const secs = t._seconds ?? t.seconds;
        if (typeof secs === "number") {
          date = new Date(secs * 1000);
        }
      }
    } else if (typeof ts === "string" || typeof ts === "number") {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) date = d;
    }

    if (!date || isNaN(date.getTime())) return "";
    return format(date, "HH:mm");
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Chat with Manager</h1>
          <p className="page-subtitle">
            {connected ? (
              <span style={{ color: "var(--success)" }}>● Connected</span>
            ) : (
              <span style={{ color: "var(--text-muted)" }}>
                ○ Connecting...
              </span>
            )}
          </p>
        </div>
      </div>

      <div
        className="chat-container"
        style={{
          height: "calc(100vh - 160px)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div className="chat-main">
          <div className="chat-header">
            <div className="avatar avatar-sm">M</div>
            <div>
              <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                Manager
              </p>
              <p style={{ fontSize: 12, color: "var(--success)" }}>● Online</p>
            </div>
          </div>

          <div className="chat-messages">
            {loading ? (
              <div className="page-loading" style={{ height: 200 }}>
                <div className="spinner spinner-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 24px",
                  color: "var(--text-muted)",
                }}
              >
                <MessageSquare
                  size={40}
                  style={{ margin: "0 auto 12px", opacity: 0.3 }}
                />
                <p style={{ fontSize: 14 }}>
                  No messages yet. Say hello to your manager! 👋
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderRole === "employee";
                return (
                  <div
                    key={msg.id}
                    className={`chat-message ${isMine ? "sent" : ""}`}
                  >
                    {!isMine && <div className="avatar avatar-sm">M</div>}
                    <div>
                      <div
                        className={`chat-bubble ${isMine ? "sent" : "received"}`}
                      >
                        {msg.text}
                      </div>
                      <div className="chat-timestamp">
                        {getTimestamp(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="chat-typing">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
                <span style={{ marginLeft: 4 }}>Manager is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              className="chat-input"
              placeholder="Type a message... (Enter to send)"
              value={newMessage}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
