"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Loader2, RotateCw, Shield, Car, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/components/providers/auth-provider";
import { communityService } from "@/services/community.service";
import type { CommunityMessage } from "@/types";

export default function CommunityPage() {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (showLoading = false) => {
    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    if (showLoading) setIsLoading(true);
    try {
      const token = JSON.parse(rawAuth).accessToken;
      const data = await communityService.getMessages(token);
      setMessages(data);
      setError("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load messages.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initial load
  useEffect(() => {
    fetchMessages(true);

    if (typeof window !== "undefined") {
      localStorage.setItem("routelink-last-community-visit", new Date().toISOString());
    }

    return () => {
      if (typeof window !== "undefined") {
        localStorage.setItem("routelink-last-community-visit", new Date().toISOString());
      }
    };
  }, [user]);


  // Polling for new messages every 5 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Scroll on new message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    setIsSending(true);
    try {
      const token = JSON.parse(rawAuth).accessToken;
      const msg = await communityService.postMessage(newMessage.trim(), token);
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

  const isAdmin = user?.role === "admin";

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">RouteLink Community</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {isAdmin
              ? "Moderator View. You see messages from the last 12 hours before permanent deletion."
              : "Chat with commuters in Lahore. Messages disappear after 6 hours."}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => fetchMessages(true)}
          title="Refresh messages"
          className="h-9 w-9 text-neutral-500"
        >
          <RotateCw className="size-4" />
        </Button>
      </div>

      {/* Message Log */}
      <Card className="flex-1 overflow-hidden border-neutral-200 flex flex-col justify-between min-h-0 bg-neutral-50/50">
        <CardContent className="p-4 overflow-y-auto flex-1 space-y-4 min-h-0">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-8 animate-spin text-neutral-400" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col h-full items-center justify-center text-center py-16">
              <p className="text-lg font-medium text-neutral-900">Welcome to the Community Chat!</p>
              <p className="mt-2 text-sm text-neutral-500 max-w-sm">
                Say hello to other RouteLink users. Be helpful, respect others, and keep coordinates safe.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const badge = getRoleBadge(msg.senderRole);
              const isSelf = msg.senderId === user?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col space-y-1 ${
                    isSelf ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <span className="font-semibold text-neutral-700">{msg.senderName}</span>
                    <span
                      className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${badge.classes}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {formatMessageTime(msg.createdAt)}
                    </span>
                  </div>

                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm break-words ${
                      isSelf
                        ? "bg-brand-600 text-white rounded-tr-none"
                        : "bg-white text-neutral-900 border border-neutral-100 rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </CardContent>

        {/* Input Bar */}
        <div className="p-4 border-t bg-white shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="Type your message here..."
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
      </Card>
    </div>
  );
}
