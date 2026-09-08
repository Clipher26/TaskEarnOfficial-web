"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { socialApi, ChatRoom, ChatMessage } from "@/api/socialApi";
import { Hash, Send, Users, MessageCircle } from "lucide-react";

const CHAT_CATEGORIES = [
  { id: "general", name: "General", icon: MessageCircle, color: "text-emerald-400" },
  { id: "earnpoly", name: "Earnpoly Strategy", icon: MessageCircle, color: "text-amber-400" },
  { id: "p2p", name: "P2P Trading", icon: MessageCircle, color: "text-cyan-400" },
  { id: "crypto", name: "Crypto", icon: MessageCircle, color: "text-indigo-400" },
];

export default function ChatPage() {
  const { setActiveModule } = useAppStore();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("chat");
    fetchRooms();
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const data = await socialApi.getChatRooms();
      setRooms(data);
      if (data.length > 0) {
        setActiveRoom(data[0]);
        fetchMessages(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const data = await socialApi.getChatMessages(roomId);
      setMessages(data.reverse());
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom) return;
    try {
      const msg = await socialApi.sendChatMessage(activeRoom.id, newMessage, "TEXT");
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Hash className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Community Chat</h1>
              <p className="text-[10px] text-gray-400">Connect with other earners</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto flex h-[calc(100vh-120px)]">
        <div className="w-1/3 border-r border-slate-800 overflow-y-auto">
          {CHAT_CATEGORIES.map((cat) => {
            const room = rooms.find((r) => r.category === cat.id);
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (room) {
                    setActiveRoom(room);
                    fetchMessages(room.id);
                  }
                }}
                className={`w-full flex items-center gap-2 px-3 py-3 border-b border-slate-800 transition-all ${
                  activeRoom?.category === cat.id ? "bg-indigo-500/10 border-l-2 border-l-indigo-500" : "hover:bg-slate-900/50"
                }`}
              >
                <Icon size={14} className={cat.color} />
                <span className="text-xs font-medium text-white truncate">{cat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 flex flex-col">
          {activeRoom ? (
            <>
              <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/30">
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-indigo-400" />
                  <span className="text-sm font-semibold text-white">{activeRoom.name}</span>
                  <Users size={12} className="text-slate-500 ml-auto" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {(msg.username || "U")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{msg.username || "Anonymous"}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 break-words">{msg.content}</p>
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
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-slate-400">Select a room to start chatting</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
