import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function AiChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_BASE = "http://localhost:8080";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const getEndpoint = () => {
    const role = localStorage.getItem("role"); // "ADMIN" or "USER"
    return role === "ADMIN"
      ? `${API_BASE}/ai/admin/orchestrate`
      : `${API_BASE}/ai/orchestrate`;
  };

  const getChatId = () => {
    const username = localStorage.getItem("username") || "anonymous";
    // stable per user
    return `web-session-${username}`;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not logged in. Please login again.");
      return;
    }

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const url = getEndpoint();
      const chatId = getChatId();

      const res = await axios.post(
        url,
        {
          message: text,
          chatId: chatId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiMsg = { role: "ai", content: res.data };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to get AI response";
      toast.error(typeof msg === "string" ? msg : "Failed to get AI response");
      setMessages((prev) => [
        ...prev,
        { role: "error", content: "Error: Could not connect to AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">AI Assistant</h2>

        <div className="text-end">
          <div className="small text-muted">
            Session: <span className="fw-semibold">{getChatId()}</span>
          </div>
          
          
        </div>
      </div>

      <div
        className="card shadow-sm"
        style={{ height: "520px", display: "flex", flexDirection: "column" }}
      >
        <div
          className="card-body"
          style={{ overflowY: "auto", flex: 1, background: "#f8f9fa" }}
        >
          {messages.length === 0 && (
            <div className="text-center text-muted mt-5">
              <h5>How can I help you?</h5>
              <div className="mt-3">
                <div>Try:</div>
                <code>find user madan</code>
                <br />
                <code>analyse him</code>
                <br />
                <code>run a profile completeness check for all users</code>
                <br />
                <code>list all admins</code>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`d-flex mb-3 ${
                msg.role === "user" ? "justify-content-end" : "justify-content-start"
              }`}
            >
              <div
                className={`p-3 rounded-3 ${
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : msg.role === "error"
                    ? "bg-danger text-white"
                    : "bg-white border"
                }`}
                style={{ maxWidth: "80%", whiteSpace: "pre-wrap" }}
              >
                <strong>{msg.role === "user" ? "You" : msg.role === "ai" ? "AI" : "Error"}:</strong>
                <div style={{ marginTop: "6px" }}>{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="d-flex justify-content-start mb-3">
              <div className="bg-white border p-3 rounded-3">
                <span className="spinner-border spinner-border-sm text-primary me-2"></span>
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="card-footer bg-white">
          <form onSubmit={handleSend} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              Send
            </button>
          </form>

          <div className="mt-2 small text-muted">
            Note: USER uses read-only orchestrator. ADMIN uses admin orchestrator.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiChat;