"use client";

import React, { useEffect, useState, useRef } from "react";
import { socialApi, ChatRoom, ChatMessage } from "@/api/socialApi";

interface ChatRoomProps {
  room: ChatRoom;
  userId: string;
}

export const ChatRoomComponent: React.FC<ChatRoomProps> = ({ room, userId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [room.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const data = await socialApi.getChatMessages(room.id);
      setMessages(data.reverse());
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const msg = await socialApi.sendChatMessage(room.id, newMessage);
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-slate-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.user_id === userId ? "flex-row-reverse" : ""}`}>
              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {(msg.username || "U")[0].toUpperCase()}
              </div>
              <div className={`flex-1 min-w-0 ${msg.user_id === userId ? "text-right" : ""}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-semibold text-white">{msg.username || "Anonymous"}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className={`inline-block max-w-[80%] px-3 py-1.5 rounded-xl text-xs ${
                  msg.user_id === userId ? "bg-indigo-500/20 text-indigo-100" : "bg-slate-950/60 text-slate-300 border border-slate-800"
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white transition-all active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
