import { apiClient } from "./api-client";
import type { User, Ride, Booking } from "@/types";

export interface AdminStats {
  totalUsers: number;
  totalDrivers: number;
  totalPassengers: number;
  totalRides: number;
  activeRequests: number;
  usersTrend: { label: string; count: number }[];
  ridesTrend: { label: string; count: number }[];
  recentUsers: User[];
  recentRides: Ride[];
}

export const adminService = {
  async getStats(token: string): Promise<AdminStats> {
    return apiClient<AdminStats>("/admin/stats", {
      method: "GET",
      token,
    });
  },

  async getUsers(token: string): Promise<User[]> {
    return apiClient<User[]>("/admin/users", {
      method: "GET",
      token,
    });
  },

  async updateUserRole(
    id: string,
    role: string,
    isVerified: boolean,
    token: string
  ): Promise<User> {
    return apiClient<User>(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: { role, isVerified },
      token,
    });
  },

  async deleteUser(id: string, token: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/admin/users/${id}`, {
      method: "DELETE",
      token,
    });
  },

  async getRides(token: string): Promise<Ride[]> {
    return apiClient<Ride[]>("/admin/rides", {
      method: "GET",
      token,
    });
  },

  async deleteRide(id: string, token: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/admin/rides/${id}`, {
      method: "DELETE",
      token,
    });
  },

  async getBookings(token: string): Promise<Booking[]> {
    return apiClient<Booking[]>("/admin/bookings", {
      method: "GET",
      token,
    });
  },
};
