"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "سلام 👋\nمن فروشنده هوشمند هستم.\nچه کمکی از من می‌خواهید؟",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e) {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = await response.json();

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: data.content || data.error || "پاسخی دریافت نشد.",
        },
      ]);
    } catch (error) {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "خطا در اتصال به سرور.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="chat-container">
      <header className="chat-header">
        <div>
          <h1>فروشنده هوشمند</h1>
          <p>دستیار فروش اختصاصی شما</p>
        </div>

        <span className="status"></span>
      </header>

      <section className="messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role}`}
          >
            <div className="message-bubble">
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-bubble">
              در حال پاسخ...
            </div>
          </div>
        )}
      </section>

      <form className="chat-form" onSubmit={sendMessage}>
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="پیام خود را بنویسید..."
          disabled={loading}
        />

        <button
          className="send-button"
          type="submit"
          disabled={loading}
        >
          ارسال
        </button>
      </form>
    </main>
  );
}
