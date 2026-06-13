"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/admin.service";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Loader2, Search, Trash2, Shield, ToggleLeft, ToggleRight, CheckCircle, XCircle } from "lucide-react";
import type { User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const loadUsers = useCallback(async () => {
    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      const data = await adminService.getUsers(token);
      setUsers(data);
      setIsLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load user list.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId: string, currentRole: string, isVerified: boolean) => {
    if (typeof window === "undefined") return;
    
    // Simple cycle: passenger -> driver -> admin -> passenger
    let nextRole: "passenger" | "driver" | "admin" = "passenger";
    if (currentRole === "passenger") nextRole = "driver";
    else if (currentRole === "driver") nextRole = "admin";
    else if (currentRole === "admin") nextRole = "passenger";

    // Block admin from demoting themselves
    if (userId === currentUser?.id) {
      alert("You cannot modify your own administrative role state.");
      return;
    }

    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      const updatedUser = await adminService.updateUserRole(userId, nextRole, isVerified, token);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    } catch (err: any) {
      alert(err.message || "Failed to update user role.");
    }
  };

  const handleToggleVerify = async (userId: string, role: string, currentVerify: boolean) => {
    if (typeof window === "undefined") return;
    
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      const updatedUser = await adminService.updateUserRole(userId, role, !currentVerify, token);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    } catch (err: any) {
      alert(err.message || "Failed to toggle verification status.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (typeof window === "undefined") return;
    if (userId === currentUser?.id) {
      alert("You cannot delete your own admin account.");
      return;
    }

    const confirmText = "Are you sure you want to permanently delete this user? All of their hosted rides and bookings will also be deleted. This action cannot be undone.";
    if (!window.confirm(confirmText)) return;

    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await adminService.deleteUser(userId, token);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      alert(err.message || "Failed to delete user account.");
    }
  };

  // Filter & Search logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));
      
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-6 text-red-400">
        <h3 className="font-semibold">Error Loading Users</h3>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl">
          User Management
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Monitor accounts, manage authorization roles, and toggle safety verification states.
        </p>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500" />
          <Input
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-10 border-neutral-800 bg-neutral-950 text-neutral-100 placeholder-neutral-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
          {["all", "passenger", "driver", "admin"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border capitalize transition-all ${
                roleFilter === role
                  ? "bg-brand-600 border-brand-500 text-white"
                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {role === "all" ? "All Roles" : role}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 font-semibold text-xs tracking-wider uppercase">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="text-neutral-300 hover:bg-neutral-850/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-neutral-200">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">{u.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">{u.phone || "—"}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRoleChange(u.id, u.role, u.isVerified)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                        u.role === "admin"
                          ? "bg-brand-500/10 text-brand-400 border-brand-500/25 hover:bg-brand-500/20"
                          : u.role === "driver"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20"
                          : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-800"
                      }`}
                      title="Click to cycle role"
                    >
                      <Shield className="size-3" />
                      {u.role}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleVerify(u.id, u.role, u.isVerified)}
                      className="flex items-center gap-1.5 cursor-pointer text-xs font-medium hover:opacity-85 transition-opacity"
                      title={u.isVerified ? "Revoke Verification" : "Verify Account"}
                    >
                      {u.isVerified ? (
                        <>
                          <CheckCircle className="size-4 text-emerald-500" />
                          <span className="text-emerald-400">Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="size-4 text-neutral-600" />
                          <span className="text-neutral-500">Unverified</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-xs text-neutral-500">
                    {new Date(u.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === currentUser?.id}
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:bg-red-950/20 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 text-sm">
                    No users matching search filters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
