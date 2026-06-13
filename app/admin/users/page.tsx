"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/admin.service";
import { useAuthContext } from "@/components/providers/auth-provider";
import { 
  Loader2, Search, Trash2, Shield, CheckCircle, XCircle, 
  UserX, Ban, UserCheck, ShieldCheck, Car, Image, FileText 
} from "lucide-react";
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

  // Handle Driver Approval / Rejection
  const handleVerifyDriver = async (userId: string, action: "approve" | "reject") => {
    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    const token = JSON.parse(rawAuth).accessToken;
    try {
      const updatedUser = await adminService.verifyDriver(userId, action, token);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
      alert(`Driver application has been ${action}d successfully.`);
    } catch (err: any) {
      alert(err.message || `Failed to ${action} driver application.`);
    }
  };

  // Handle User Status Modification (Suspend, Ban, Restore)
  const handleUserStatusChange = async (userId: string, action: "suspend" | "ban" | "restore") => {
    if (typeof window === "undefined") return;
    if (userId === currentUser?.id) {
      alert("You cannot suspend or ban your own administrator account.");
      return;
    }

    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    const token = JSON.parse(rawAuth).accessToken;
    try {
      const updatedUser = await adminService.updateUserStatus(userId, action, token);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    } catch (err: any) {
      alert(err.message || `Failed to ${action} user status.`);
    }
  };

  // Legacy cycle role functionality
  const handleRoleChange = async (userId: string, currentRole: string, isVerified: boolean) => {
    if (typeof window === "undefined") return;
    
    let nextRole: "passenger" | "driver" | "admin" = "passenger";
    if (currentRole === "passenger") nextRole = "driver";
    else if (currentRole === "driver") nextRole = "admin";
    else if (currentRole === "admin") nextRole = "passenger";

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

  // Toggle user verify boolean directly
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

  // Delete user permanently
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

  // Extract pending driver verification applications
  const pendingDrivers = users.filter(
    (u) => u.driverApplicationStatus === "pending"
  );

  // Filter & Search logic for standard user list
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
      <div className="flex h-96 items-center justify-center bg-neutral-900">
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
    <div className="space-y-8 animate-in fade-in duration-200 text-neutral-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl">
          User & Driver Management
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Verify driver applications, toggle suspension rules, ban malicious accounts, or adjust roles.
        </p>
      </div>

      {/* PENDING DRIVER VERIFICATION SECTION */}
      {pendingDrivers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <Car className="size-5" />
            Pending Driver Applications ({pendingDrivers.length})
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {pendingDrivers.map((driver) => (
              <div 
                key={driver.id} 
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-lg space-y-4"
              >
                {/* Driver basic info */}
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden border border-neutral-700">
                    {driver.avatarUrl ? (
                      <img src={driver.avatarUrl} alt="Avatar" className="size-full object-cover" />
                    ) : (
                      <UserCheck className="size-5 text-neutral-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-neutral-200">
                      {driver.firstName} {driver.lastName}
                    </h3>
                    <p className="text-xs text-neutral-500">{driver.email} &middot; {driver.phone || "No phone"}</p>
                  </div>
                </div>

                {/* Vehicle specifics */}
                <div className="grid gap-3 sm:grid-cols-2 text-xs bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-800/60">
                  <div className="space-y-1">
                    <span className="text-neutral-500 font-medium">Vehicle Model:</span>
                    <p className="font-bold text-neutral-200 capitalize">{driver.vehicleType || "Not specified"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-neutral-500 font-medium">Registration Plate:</span>
                    <p className="font-mono font-bold text-brand-400">{driver.vehicleRegistration || "Not specified"}</p>
                  </div>
                </div>

                {/* Documents & photos attachments links */}
                <div className="flex gap-4 text-xs">
                  {driver.vehiclePhotos && driver.vehiclePhotos.length > 0 && (
                    <a 
                      href={driver.vehiclePhotos[0]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-semibold"
                    >
                      <Image className="size-3.5" />
                      View Vehicle Photo
                    </a>
                  )}
                  {driver.drivingLicense && (
                    <a 
                      href={driver.drivingLicense} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-semibold"
                    >
                      <FileText className="size-3.5" />
                      View License copy
                    </a>
                  )}
                </div>

                {/* Acceptance action buttons */}
                <div className="flex gap-2.5 pt-2 border-t border-neutral-800">
                  <Button
                    onClick={() => handleVerifyDriver(driver.id, "approve")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="size-4" /> Approve
                  </Button>
                  <Button
                    onClick={() => handleVerifyDriver(driver.id, "reject")}
                    variant="ghost"
                    className="flex-1 text-red-400 hover:bg-red-950/20 hover:text-red-300 border border-neutral-800 rounded-lg h-9 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <XCircle className="size-4" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH AND ROLE FILTERS PANEL */}
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

        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end overflow-x-auto">
          {["all", "passenger", "driver", "admin"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all shrink-0 ${
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

      {/* CORE USERS MANAGEMENT TABLE */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 font-semibold text-xs tracking-wider uppercase">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">System Role</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Access Status</th>
                <th className="px-6 py-4 text-right">Moderations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredUsers.map((u) => {
                // Determine moderation status badge
                let statusBadge = (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                    Active
                  </Badge>
                );
                if (u.isBanned) {
                  statusBadge = (
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-bold">
                      Banned
                    </Badge>
                  );
                } else if (u.isSuspended) {
                  statusBadge = (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-bold">
                      Suspended
                    </Badge>
                  );
                }

                return (
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
                        title="Click to cycle role (Cycle)"
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
                            <span className="text-emerald-400 text-xs">Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="size-4 text-neutral-600" />
                            <span className="text-neutral-500 text-xs">Unverified</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {statusBadge}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.isSuspended || u.isBanned ? (
                          <Button
                            onClick={() => handleUserStatusChange(u.id, "restore")}
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-[10px] font-bold border-emerald-800 text-emerald-400 hover:bg-emerald-950/20 rounded-lg flex items-center gap-1"
                          >
                            <UserCheck className="size-3" /> Restore
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleUserStatusChange(u.id, "suspend")}
                              disabled={u.id === currentUser?.id}
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 text-[10px] font-bold border-amber-800 text-amber-400 hover:bg-amber-950/20 rounded-lg flex items-center gap-1"
                            >
                              <UserX className="size-3" /> Suspend
                            </Button>
                            <Button
                              onClick={() => handleUserStatusChange(u.id, "ban")}
                              disabled={u.id === currentUser?.id}
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 text-[10px] font-bold border-red-900/80 text-red-400 hover:bg-red-950/20 rounded-lg flex items-center gap-1"
                            >
                              <Ban className="size-3" /> Ban
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === currentUser?.id}
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:bg-red-950/20 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed size-8"
                          title="Delete Permanently"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
