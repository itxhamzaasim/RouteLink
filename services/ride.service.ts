import { apiClient } from "./api-client";
import type { Ride, RideRequest } from "@/types";

export const rideService = {
  async getDriverRides(token: string): Promise<Ride[]> {
    return apiClient<Ride[]>("/rides/driver", {
      method: "GET",
      token,
    });
  },

  async createRide(
    rideData: Omit<Ride, "id" | "driverId" | "driverName" | "driverRating" | "status">,
    token: string
  ): Promise<Ride> {
    return apiClient<Ride>("/rides", {
      method: "POST",
      body: rideData,
      token,
    });
  },

  async updateRide(
    id: string,
    rideData: Partial<Omit<Ride, "id" | "driverId" | "driverName" | "driverRating">>,
    token: string
  ): Promise<Ride> {
    return apiClient<Ride>(`/rides/${id}`, {
      method: "PUT",
      body: rideData,
      token,
    });
  },

  async deleteRide(id: string, token: string): Promise<void> {
    return apiClient<void>(`/rides/${id}`, {
      method: "DELETE",
      token,
    });
  },

  async searchRides(
    params: {
      originCity?: string;
      destinationCity?: string;
      date?: string;
      seats?: number;
      sortBy?: string;
      sortOrder?: string;
      page?: number;
      limit?: number;
    },
    token: string
  ): Promise<{
    rides: Ride[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params.originCity) query.append("originCity", params.originCity);
    if (params.destinationCity) query.append("destinationCity", params.destinationCity);
    if (params.date) query.append("date", params.date);
    if (params.seats) query.append("seats", String(params.seats));
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.sortOrder) query.append("sortOrder", params.sortOrder);
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));

    return apiClient<{
      rides: Ride[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
    }>(`/rides?${query.toString()}`, {
      method: "GET",
      token,
    });
  },

  async getRideById(id: string, token: string): Promise<Ride> {
    return apiClient<Ride>(`/rides/${id}`, {
      method: "GET",
      token,
    });
  },

  // Ride Request service integrations
  async getRideRequests(token: string): Promise<RideRequest[]> {
    return apiClient<RideRequest[]>("/rides/requests", {
      method: "GET",
      token,
    });
  },

  async createRideRequest(
    requestData: Omit<RideRequest, "id" | "passengerId" | "passengerName" | "passengerRating" | "status" | "driverId">,
    token: string
  ): Promise<RideRequest> {
    return apiClient<RideRequest>("/rides/requests", {
      method: "POST",
      body: requestData,
      token,
    });
  },

  async acceptRideRequest(id: string, token: string): Promise<RideRequest> {
    return apiClient<RideRequest>(`/rides/requests/${id}`, {
      method: "PUT",
      body: { status: "accepted" },
      token,
    });
  },

  async deleteRideRequest(id: string, token: string): Promise<void> {
    return apiClient<void>(`/rides/requests/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
