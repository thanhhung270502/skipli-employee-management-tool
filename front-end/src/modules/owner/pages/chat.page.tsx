"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { axiosInstance, getUser, connectSocket, disconnectSocket, getRoomId } from "@/common/lib";
import { useQueryEmployees } from "@/shared/hooks";
import { API_GET_MESSAGES } from "@/common/models/chat";
import type { MessageObject, GetMessagesResponse } from "@/common/models/chat";
import type { EmployeeObject } from "@/common/models/employee";
import { logger } from "@/shared/libs";

export function ChatPage() {
  const { data, isLoading } = useQueryEmployees();
  const employees = (data?.employees ?? []).filter((e) => e.isSetup);

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeObject | null>(null);
  const [messages, setMessages] = useState<MessageObject[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const user = getUser();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  const selectEmployee = async (emp: EmployeeObject) => {
    setSelectedEmployee(emp);
    setMessages([]);

    const roomId = getRoomId(user?.phoneNumber ?? "", emp.id);

    try {
      const res = await axiosInstance.get<GetMessagesResponse>(
        API_GET_MESSAGES.buildUrlPath(roomId)
      );
      setMessages(res.data?.messages ?? []);
    } catch (e) {
      logger.error("Failed to load messages:", { e });
    }

    const socket = connectSocket(user?.token ?? "");
    socket.off("receive_message");
    socket.off("user_typing");
    socket.off("user_stopped_typing");

    socket.emit("join_room", {
      roomId,
      userId: user?.phoneNumber,
      role: "owner",
      name: "Manager",
    });

    socket.on("receive_message", (msg: MessageObject) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("user_typing", ({ senderName }: { senderName: string }) => {
      setTypingUser(senderName);
      setIsTyping(true);
    });

    socket.on("user_stopped_typing", () => {
      setIsTyping(false);
      setTypingUser("");
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedEmployee) return;
    const socket = connectSocket(user?.token ?? "");
    const roomId = getRoomId(user?.phoneNumber ?? "", selectedEmployee.id);

    socket.emit("send_message", {
      roomId,
      senderId: user?.phoneNumber,
      senderName: "Manager",
      senderRole: "owner",
      text: newMessage.trim(),
    });
    setNewMessage("");
    socket.emit("typing_stop", { roomId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (!selectedEmployee) return;
    const socket = connectSocket(user?.token ?? "");
    const roomId = getRoomId(user?.phoneNumber ?? "", selectedEmployee.id);

    socket.emit("typing_start", { roomId, senderName: "Manager" });
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
          <h1 className="page-title">Chat</h1>
          <p className="page-subtitle">Real-time messaging with your team</p>
        </div>
      </div>

      <div className="chat-container" style={{ height: "calc(100vh - 160px)" }}>
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">💬 Conversations</div>
          {isLoading ? (
            <div className="page-loading" style={{ height: 200 }}>
              <div className="spinner spinner-primary" />
            </div>
          ) : employees.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <div className="empty-state-icon" style={{ fontSize: 32 }}>
                👥
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  textAlign: "center",
                }}
              >
                No active employees
              </p>
            </div>
          ) : (
            employees.map((emp) => (
              <div
                key={emp.id}
                className={`chat-contact ${selectedEmployee?.id === emp.id ? "active" : ""}`}
                onClick={() => selectEmployee(emp)}
              >
                <div className="avatar avatar-sm">{emp.name[0].toUpperCase()}</div>
                <div className="chat-contact-info">
                  <div className="chat-contact-name">{emp.name}</div>
                  <div className="chat-contact-preview">{emp.department}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="chat-main">
          {!selectedEmployee ? (
            <div className="page-loading" style={{ height: "100%" }}>
              <MessageSquare size={40} style={{ color: "var(--text-muted)", opacity: 0.4 }} />
              <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
                Select an employee to start chatting
              </p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="avatar avatar-sm">{selectedEmployee.name[0].toUpperCase()}</div>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {selectedEmployee.name}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--success)" }}>● Online</p>
                </div>
              </div>

              <div className="chat-messages">
                {messages.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      color: "var(--text-muted)",
                      fontSize: 13,
                    }}
                  >
                    No messages yet. Say hello! 👋
                  </div>
                )}
                {messages.map((msg) => {
                  const isMine = msg.senderRole === "owner";
                  return (
                    <div key={msg.id} className={`chat-message ${isMine ? "sent" : ""}`}>
                      {!isMine && <div className="avatar avatar-sm">{msg.senderName[0]}</div>}
                      <div>
                        <div className={`chat-bubble ${isMine ? "sent" : "received"}`}>
                          {msg.text}
                        </div>
                        <div className="chat-timestamp">{getTimestamp(msg.timestamp)}</div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="chat-typing">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <span style={{ marginLeft: 4 }}>{typingUser} is typing...</span>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
