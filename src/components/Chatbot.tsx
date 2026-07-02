"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";

interface Message {
  role: "user" | "bot";
  text: string;
}

export default function Chatbot() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! Welcome to MDFK CLOTHING . How can I help you today? You can ask about our catalog, return policy, or log in to track your orders.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "What do you sell?",
    "Track my orders",
    "Return policy",
    "Payment options",
  ];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Gather chat history (excluding system prompt helper)
      const chatHistory = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await apiFetch("/chatbot", {
        method: "POST",
        body: JSON.stringify({
          message: text,
          history: chatHistory,
        }),
      });

      if (res.success && res.reply) {
        setMessages((prev) => [...prev, { role: "bot", text: res.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "Sorry, I ran into an error processing that. Please try again." },
        ]);
      }
    } catch (err) {
      console.error("Chatbot request failed:", err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Network error. Please make sure the backend server is running." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-4 w-[360px] max-w-[calc(100vw-2rem)] h-[480px] rounded-3xl bg-brand-bg border border-brand-charcoal/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brand-charcoal p-4 text-brand-bg flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-brand-green rounded-xl flex items-center justify-center">
                  <Bot className="h-4 w-4 text-brand-bg" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-wider uppercase flex items-center">
                    MDFK Assistant
                    <Sparkles className="h-3 w-3 ml-1 text-brand-bg/60" />
                  </h4>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-brand-bg/60">We're online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-brand-bg/80 hover:text-brand-bg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3 flex flex-col">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-brand-charcoal text-brand-bg rounded-tr-none"
                        : "bg-brand-gray/60 text-brand-charcoal border border-brand-charcoal/5 rounded-tl-none"
                    }`}
                  >
                    {msg.text.split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-1.5" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-brand-gray/60 text-brand-charcoal rounded-2xl rounded-tl-none px-4 py-3 text-xs border border-brand-charcoal/5 flex items-center space-x-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-green" />
                    <span className="text-brand-charcoal/60">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions (Shown when input is empty & not loading) */}
            {inputValue === "" && !isLoading && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-3 py-1.5 bg-brand-bg hover:bg-brand-gray text-[10px] font-semibold text-brand-charcoal/70 border border-brand-charcoal/10 rounded-full transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3 border-t border-brand-charcoal/5 bg-brand-bg/85 backdrop-blur flex gap-2"
            >
              <input
                type="text"
                placeholder={user ? "Ask anything..." : "Log in to check orders..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-grow rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-2.5 text-xs focus:border-brand-green focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="p-2.5 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-bg rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full bg-brand-charcoal text-brand-bg shadow-lg flex items-center justify-center cursor-pointer transition-colors border border-brand-charcoal"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </motion.button>
    </div>
  );
}
