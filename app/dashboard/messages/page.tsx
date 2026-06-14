"use client";

import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Loader2, MessageSquare, Car, User, Search, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/components/providers/auth-provider";
import { messageService } from "@/services/message.service";
import type { ChatPartner, DirectMessage } from "@/types";

function MessagesContent() {
  const { user } = useAuthContext();
  const searchParams = useSearchParams();
  const paramUserId = searchParams.get("userId");
  const paramName = searchParams.get("name");
  const paramRole = searchParams.get("role");
  const paramAutoMessage = searchParams.get("autoMessage");

  const [partners, setPartners] = useState<ChatPartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isPartnersLoading, setIsPartnersLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const autoMessageSentRef = useRef(false);

  // Callback to fetch chat partners
  const fetchPartners = useCallback(async (isSilent = false) => {
    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    if (!isSilent) setIsPartnersLoading(true);
    try {
      const token = JSON.parse(rawAuth).accessToken;
      let data = await messageService.getChatPartners(token);
      
      if (paramUserId && paramName && paramRole && !isSilent) {
        const exists = data.some((p) => p.id === paramUserId);
        const targetPartner = {
          id: paramUserId,
          name: paramName,
          role: paramRole,
        };
        if (!exists) {
          data = [targetPartner, ...data];
        }
        setPartners(data);

        if (paramAutoMessage && !autoMessageSentRef.current) {
          autoMessageSentRef.current = true;
          try {
            await messageService.sendDirectMessage(
              paramUserId,
              paramAutoMessage,
              token
            );
          } catch (err) {
            console.error("Failed to send auto message:", err);
          }
          window.history.replaceState(null, "", window.location.pathname);
        }
        
        setSelectedPartner(targetPartner);
      } else {
        // Update partners list and keep selected partner reset locally
        setPartners((prev) => {
          return data.map((newP) => {
            if (selectedPartner && newP.id === selectedPartner.id) {
              return { ...newP, unreadCount: 0 };
            }
            return newP;
          });
        });
      }
    } catch (err) {
      console.error("Failed to load chat partners:", err);
    } finally {
      if (!isSilent) setIsPartnersLoading(false);
    }
  }, [user, paramUserId, paramName, paramRole, paramAutoMessage, selectedPartner]);

  // Initial load
  useEffect(() => {
    fetchPartners(false);
  }, [user]);

  // Polling for partner list updates to catch new messages/counts
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchPartners(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [user, fetchPartners]);

  // Fetch messages when selectedPartner changes
  const fetchMessages = async (showLoading = false) => {
    if (typeof window === "undefined" || !user || !selectedPartner) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    if (showLoading) setIsMessagesLoading(true);
    try {
      const token = JSON.parse(rawAuth).accessToken;
      const data = await messageService.getDirectMessages(selectedPartner.id, token);
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      if (showLoading) setIsMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPartner) {
      fetchMessages(true);
      // Mark read locally instantly
      setPartners((prev) =>
        prev.map((p) => (p.id === selectedPartner.id ? { ...p, unreadCount: 0 } : p))
      );
    } else {
      setMessages([]);
    }
  }, [selectedPartner]);

  // Live polling for new DMs every 3 seconds
  useEffect(() => {
    if (!user || !selectedPartner) return;
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [user, selectedPartner]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !selectedPartner) return;

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    setIsSending(true);
    try {
      const token = JSON.parse(rawAuth).accessToken;
      const msg = await messageService.sendDirectMessage(
        selectedPartner.id,
        newMessage.trim(),
        token
      );
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (err: any) {
      alert(err.message || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  const getPartnerInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return {
          label: "Admin",
          classes: "bg-red-50 text-red-700 border-red-200",
          icon: <Shield className="size-3 text-red-500 mr-1 inline" />,
        };
      case "driver":
        return {
          label: "Driver",
          classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <Car className="size-3 text-emerald-500 mr-1 inline" />,
        };
      default:
        return {
          label: "Passenger",
          classes: "bg-purple-50 text-purple-700 border-purple-200",
          icon: <User className="size-3 text-purple-500 mr-1 inline" />,
        };
    }
  };

  // Filter partners by search query
  const filteredPartners = partners.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden border border-neutral-200 rounded-2xl bg-white shadow-sm max-w-6xl mx-auto">
      {/* Sidebar Pane - Chat Partners */}
      <div className="w-80 shrink-0 border-r border-neutral-200 flex flex-col justify-between bg-neutral-50/50">
        <div className="p-4 border-b border-neutral-200 bg-white space-y-3 shrink-0">
          <h1 className="text-xl font-bold text-neutral-900">Direct Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-neutral-400" />
            <Input
              placeholder="Search chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 border-neutral-200 focus-visible:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isPartnersLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-neutral-400" />
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="p-4 text-center text-sm text-neutral-500 mt-8">
              {searchQuery ? "No matches found." : "No active ride chats."}
            </div>
          ) : (
            filteredPartners.map((partner) => {
              const isSelected = selectedPartner?.id === partner.id;
              const badge = getRoleBadge(partner.role);
              return (
                <button
                  key={partner.id}
                  onClick={() => setSelectedPartner(partner)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left cursor-pointer ${
                    isSelected
                      ? "bg-brand-50/80 border-brand-100 shadow-sm"
                      : "hover:bg-neutral-100/60"
                  }`}
                >
                  <div
                    className={`size-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? "bg-brand-600 text-white"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {getPartnerInitials(partner.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-neutral-900 truncate text-sm">
                        {partner.name}
                      </p>
                      {partner.unreadCount && partner.unreadCount > 0 && !isSelected && (
                        <span className="size-2.5 rounded-full bg-emerald-500 shrink-0 ml-2 animate-pulse" />
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-full border px-1.5 py-0.2 text-[9px] font-medium ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Pane */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white">
        {selectedPartner ? (
          <>
            {/* Active Chat Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                  {getPartnerInitials(selectedPartner.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">
                    {selectedPartner.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="size-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-neutral-500 font-medium capitalize">
                      {selectedPartner.role} Partner
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-neutral-50/30">
              {isMessagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-neutral-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col h-full items-center justify-center text-center py-16">
                  <MessageSquare className="size-10 text-neutral-300 mb-2" />
                  <p className="text-sm font-semibold text-neutral-900">
                    This is the start of your direct chat history.
                  </p>
                  <p className="text-xs text-neutral-500 max-w-xs mt-1">
                    Say hello to coordinate pick-up times, route detours, or luggage details.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSelf = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm break-words ${
                          isSelf
                            ? "bg-brand-600 text-white rounded-tr-none"
                            : "bg-white text-neutral-900 border border-neutral-100 rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-neutral-400 mt-1 px-1">
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-neutral-200 shrink-0 bg-white">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  maxLength={500}
                  className="flex-1 h-11 border-neutral-200 focus-visible:ring-brand-500"
                />
                <Button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="bg-brand-600 text-white hover:bg-brand-700 h-11 px-5 cursor-pointer"
                >
                  {isSending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span className="sr-only">Send</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-neutral-50/10">
            <div className="size-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4 shadow-sm">
              <MessageSquare className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Your Conversations</h3>
            <p className="text-sm text-neutral-500 max-w-sm mt-1">
              Select an active partner chat from the sidebar to coordinate your shared commute, or book rides to establish new messaging connections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center bg-white border border-neutral-200 rounded-2xl shadow-sm">
        <Loader2 className="size-8 animate-spin text-brand-600" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}

