import { useState, useRef, useEffect } from "react";
import "./App.css";

export default function App() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // автопрокрутка вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setChat((prev) => [...prev, { sender: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("http://5.228.202.18:5678/webhook/rag_query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage }),
      });

      const data = await response.json();
      setChat((prev) => [...prev, { sender: "ai", text: data.output }]);
    } catch (err) {
      console.error("Ошибка:", err);
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: "Ошибка при подключении к AI." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatgpt-container">
      {/* Заголовок */}
      <div className="chat-header">
        <h1>RAG AI Assistant</h1>
      </div>

      {/* Окно сообщений */}
      <div className="chat-messages">
        {chat.length === 0 ? (
          <div className="welcome-message">
            <div className="welcome-icon">
              <img src="/1.png" alt="AI Assistant" />
            </div>
            <h2>Чем я могу вам помочь?</h2>
          </div>
        ) : (
          chat.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${msg.sender === "user" ? "user-message" : "ai-message"}`}
            >
              <div className="message-avatar">
                {msg.sender === "user" ? "👤" : <img src="/1.png" alt="AI" />}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.text}</div>
              </div>
            </div>
          ))
        )}
        
        {/* Индикатор загрузки */}
        {isLoading && (
          <div className="message ai-message">
            <div className="message-avatar">
              <img src="/1.png" alt="AI" />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Форма ввода */}
      <div className="chat-input-container">
        <form onSubmit={sendMessage} className="chat-input-form">
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Введите ваш вопрос..."
              disabled={isLoading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="send-button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </form>
        <div className="chat-footer">
          <span>RAG AI Assistant может допускать ошибки. Проверяйте важную информацию.</span>
        </div>
      </div>
    </div>
  );
}
