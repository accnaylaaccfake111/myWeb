// frontend/src/components/ChatBot.js
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, X, Minimize2, Maximize2 } from "lucide-react";
import chatbotIcon from "../assets/img/chatbot.png";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là trợ lý AI về văn hóa Việt Nam. Tôi có thể giúp gì cho bạn?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Fake response - sẽ thay bằng API sau
    setTimeout(() => {
      const botResponses = [
        "Tôi có thể giúp bạn tìm hiểu về các điệu múa truyền thống Việt Nam như múa lân, múa rối nước, múa xòe...",
        "Bạn muốn tìm hiểu về lịch sử văn hóa Phú Lễ hay các lễ hội truyền thống của Việt Nam?",
        "Tôi có thể hướng dẫn bạn sử dụng các tính năng AI như mô phỏng múa, sáng tác lời bài hát, hay ghép mặt vui nhộn...",
        "Văn hóa Việt Nam có nhiều nét đặc sắc như hát xoan, ca trù, quan họ, chèo... Bạn quan tâm đến thể loại nào?",
        "Tôi có thể giải thích về ý nghĩa của các điệu múa dân gian và cách thực hiện chúng theo công nghệ AI.",
      ];

      const randomResponse =
        botResponses[Math.floor(Math.random() * botResponses.length)];

      const botMessage = {
        id: messages.length + 2,
        text: randomResponse,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const suggestedQuestions = [
    "Các điệu múa truyền thống Việt Nam?",
    "Lịch sử văn hóa Phú Lễ?",
    "Cách sử dụng tính năng AI?",
    "Lễ hội truyền thống nào?",
  ];

  const handleSuggestionClick = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-red-600 to-amber-600 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center group animate-bounce"
        style={{ animationDuration: "2s" }}
      >
        <img
          src={chatbotIcon}
          alt="ChatBot"
          className="w-10 h-10 object-contain filter brightness-0 invert"
        />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-amber-600 opacity-0 group-hover:opacity-20 animate-ping"></div>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isMinimized ? "w-80 h-16" : "w-80 h-[500px]"
      }`}
    >
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-red-600 to-amber-600 rounded-t-2xl p-4 text-white shadow-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <img
                src={chatbotIcon}
                alt="ChatBot"
                className="w-6 h-6 object-contain filter brightness-0 invert"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-bold text-sm">Trợ lý Văn Hóa AI</h3>
            <p className="text-xs opacity-90 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
              Đang trực tuyến
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Messages */}
          <div className="bg-white h-72 overflow-y-auto p-4 border-l border-r border-gray-200 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isBot ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                      message.isBot
                        ? "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100"
                        : "bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-tr-none shadow-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.isBot ? "text-slate-500" : "text-white/80"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 text-slate-800 rounded-2xl rounded-tl-none p-4 max-w-[85%] border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500">
                        Đang trả lời...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggested Questions */}
          {messages.length <= 2 && (
            <div className="bg-gradient-to-b from-slate-50 to-white border-l border-r border-slate-200 p-4">
              <p className="text-xs text-slate-600 mb-3 font-medium">
                Câu hỏi thường gặp:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(question)}
                    className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50 transition-all duration-200 text-slate-700 hover:text-red-600 hover:border-red-200 hover:shadow-sm text-left"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-4 shadow-lg">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Nhập câu hỏi về văn hóa Việt Nam..."
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-slate-50 placeholder-slate-400 transition-all duration-200"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-2xl p-3 hover:from-red-700 hover:to-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center min-w-[44px]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;
