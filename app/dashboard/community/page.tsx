"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { communityService } from "@/services/community.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, RotateCw, Shield, Car, User, MessageSquare, 
  Megaphone, Plus, Trash2, Send, ChevronDown, ChevronUp 
} from "lucide-react";
import type { CommunityPost, CommunityComment } from "@/types";

export default function CommunityPage() {
  const { user } = useAuthContext();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filtering and view states
  const [selectedCategory, setSelectedCategory] = useState<"all" | "discussion" | "announcement">("all");
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, CommunityComment[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});

  // New Post Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<"discussion" | "announcement">("discussion");
  const [isPosting, setIsPosting] = useState(false);

  // New Comment states
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [isCommenting, setIsCommenting] = useState<Record<string, boolean>>({});

  const fetchPosts = useCallback(async (showLoading = false) => {
    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    if (showLoading) setIsLoading(true);
    try {
      const token = JSON.parse(rawAuth).accessToken;
      const data = await communityService.getPosts(token);
      setPosts(data);
      setError("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load community discussions.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchPosts(true);

    if (typeof window !== "undefined") {
      localStorage.setItem("routelink-last-community-visit", new Date().toISOString());
    }

    return () => {
      if (typeof window !== "undefined") {
        localStorage.setItem("routelink-last-community-visit", new Date().toISOString());
      }
    };
  }, [fetchPosts]);

  // Expand post and fetch comments
  const handleToggleComments = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }

    setExpandedPostId(postId);

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      const token = JSON.parse(rawAuth).accessToken;
      const comments = await communityService.getComments(postId, token);
      setPostComments((prev) => ({ ...prev, [postId]: comments }));
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Submit new post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || isPosting) return;

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    setIsPosting(true);
    try {
      const token = JSON.parse(rawAuth).accessToken;
      const created = await communityService.createPost({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
      }, token);

      setPosts((prev) => [created, ...prev]);
      setNewTitle("");
      setNewContent("");
      setNewCategory("discussion");
      setShowCreateForm(false);
    } catch (err: any) {
      alert(err.message || "Failed to post discussion thread.");
    } finally {
      setIsPosting(false);
    }
  };

  // Delete post (Admin only)
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this discussion thread and all its comments?")) return;

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await communityService.deletePost(postId, token);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (expandedPostId === postId) setExpandedPostId(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete post.");
    }
  };

  // Submit comment
  const handleCreateComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const commentText = newComments[postId] || "";
    if (!commentText.trim() || isCommenting[postId]) return;

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    setIsCommenting((prev) => ({ ...prev, [postId]: true }));
    try {
      const token = JSON.parse(rawAuth).accessToken;
      const created = await communityService.createComment({
        postId,
        content: commentText.trim(),
      }, token);

      setPostComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), created],
      }));
      setNewComments((prev) => ({ ...prev, [postId]: "" }));
    } catch (err: any) {
      alert(err.message || "Failed to submit comment.");
    } finally {
      setIsCommenting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Delete comment (Admin only)
  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await communityService.deleteComment(commentId, token);
      setPostComments((prev) => ({
        ...prev,
        [postId]: prev[postId].filter((c) => c.id !== commentId),
      }));
    } catch (err: any) {
      alert(err.message || "Failed to delete comment.");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 inline-flex items-center text-[10px]">
            <Shield className="size-3 text-red-500" /> Admin
          </Badge>
        );
      case "driver":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 inline-flex items-center text-[10px]">
            <Car className="size-3 text-emerald-500" /> Driver
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-neutral-50 text-neutral-600 border-neutral-200 gap-1 inline-flex items-center text-[10px]">
            <User className="size-3 text-neutral-400" /> Commuter
          </Badge>
        );
    }
  };

  const filteredPosts = posts.filter(
    (p) => selectedCategory === "all" || p.category === selectedCategory
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">Community Board</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Discuss commutes, carpools, routes, and read announcements from admins.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-brand-600 text-white hover:bg-brand-700 h-10 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="size-4" /> Start Discussion
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchPosts(true)}
            className="h-10 w-10 text-neutral-500 border-neutral-200 bg-white"
          >
            <RotateCw className="size-4" />
          </Button>
        </div>
      </div>

      {/* Write Post Collapse Form */}
      {showCreateForm && (
        <Card className="border-brand-200 shadow-sm animate-in slide-in-from-top-4 duration-350">
          <CardContent className="p-5">
            <h2 className="text-sm font-bold text-neutral-950 mb-4">Launch a new Discussion Thread</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="postTitle" className="text-xs font-semibold text-neutral-700">Topic Title</Label>
                <Input
                  id="postTitle"
                  placeholder="e.g., Carpool match DHA Phase 5 to LUMS"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-11 bg-white border-neutral-200"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="postCategory" className="text-xs font-semibold text-neutral-700">Category Tag</Label>
                  <select
                    id="postCategory"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full h-11 border border-neutral-200 rounded-xl px-3 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
                  >
                    <option value="discussion">Commuter Discussion</option>
                    {user?.role === "admin" && (
                      <option value="announcement">Platform Announcement (Admin Only)</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="postContent" className="text-xs font-semibold text-neutral-700">Content / Description</Label>
                <textarea
                  id="postContent"
                  placeholder="Describe details, routes, times, preferences..."
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-600 focus:border-brand-600 disabled:cursor-not-allowed disabled:opacity-50 text-neutral-900"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                  className="h-10 text-neutral-600 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPosting}
                  className="bg-brand-600 hover:bg-brand-700 text-white h-10 px-5 rounded-xl font-bold text-xs"
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-1.5" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Thread"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Category Navigation Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 pb-1">
        {(["all", "discussion", "announcement"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-bold capitalize transition-all border-b-2 -mb-[3px] ${
              selectedCategory === cat
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {cat === "all" ? "All Feed" : `${cat}s`}
          </button>
        ))}
      </div>

      {/* Main Forum List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-neutral-400" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            {error}
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="border-neutral-200 p-8 text-center text-neutral-500">
            No active discussion threads. Click &quot;Start Discussion&quot; above to create the first one.
          </Card>
        ) : (
          filteredPosts.map((post) => {
            const isExpanded = expandedPostId === post.id;
            const comments = postComments[post.id] || [];
            const isCommentsLoading = commentsLoading[post.id];
            const hasAnnBadge = post.category === "announcement";

            return (
              <Card 
                key={post.id} 
                className={`border-neutral-200 transition-all ${
                  hasAnnBadge ? "bg-amber-50/15 border-amber-200/60" : "bg-white"
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Post Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {hasAnnBadge ? (
                          <Badge className="bg-amber-100 border-amber-200 hover:bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide gap-1">
                            <Megaphone className="size-3" /> Announcement
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-neutral-50 border-neutral-200 text-neutral-600 font-medium px-2 py-0.5 rounded text-[10px]">
                            Discussion
                          </Badge>
                        )}
                        <span className="text-[10px] text-neutral-400">
                          {new Date(post.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-neutral-900 leading-tight">
                        {post.title}
                      </h3>
                    </div>

                    {user?.role === "admin" && (
                      <Button
                        variant="ghost"
                        onClick={() => handleDeletePost(post.id)}
                        className="size-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                        title="Delete Post"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>

                  {/* Post Content */}
                  <p className="text-xs text-neutral-700 whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>

                  {/* Author Meta & Toggle Button */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-neutral-100 pt-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-800">{post.authorName}</span>
                      <span>&middot;</span>
                      {getRoleBadge(post.authorRole)}
                    </div>

                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 mt-1 sm:mt-0"
                    >
                      <MessageSquare className="size-4" />
                      <span>Comments</span>
                      {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </button>
                  </div>

                  {/* Comments Collapsed Section */}
                  {isExpanded && (
                    <div className="border-t border-neutral-100 pt-4 mt-2 space-y-4 animate-in slide-in-from-top-3 duration-200">
                      {/* Comments list */}
                      <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-neutral-100">
                        {isCommentsLoading ? (
                          <div className="flex items-center gap-2 text-neutral-400 text-xs py-2">
                            <Loader2 className="size-4 animate-spin" />
                            Loading comments...
                          </div>
                        ) : comments.length === 0 ? (
                          <p className="text-neutral-400 text-xs py-1">No comments posted yet. Start the conversation!</p>
                        ) : (
                          comments.map((comment) => (
                            <div key={comment.id} className="text-xs space-y-1 relative group">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-neutral-800">{comment.authorName}</span>
                                {getRoleBadge(comment.authorRole)}
                                <span className="text-[10px] text-neutral-400">
                                  {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {user?.role === "admin" && (
                                  <button
                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                    className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                    title="Delete Comment"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                              <p className="text-neutral-700 leading-relaxed bg-neutral-50 rounded-lg p-2.5 max-w-2xl border border-neutral-100">
                                {comment.content}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      <form 
                        onSubmit={(e: React.FormEvent) => handleCreateComment(e, post.id)} 
                        className="flex gap-2 items-center"
                      >
                        <Input
                          placeholder="Write a comment..."
                          value={newComments[post.id] || ""}
                          onChange={(e) => setNewComments((prev) => ({ ...prev, [post.id]: e.target.value }))}
                          className="h-10 bg-white border-neutral-200 text-xs"
                        />
                        <Button
                          type="submit"
                          disabled={isCommenting[post.id] || !(newComments[post.id] || "").trim()}
                          className="bg-brand-600 hover:bg-brand-700 text-white h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs"
                        >
                          {isCommenting[post.id] ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <>
                              <Send className="size-3.5" />
                              <span>Comment</span>
                            </>
                          )}
                        </Button>
                      </form>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
