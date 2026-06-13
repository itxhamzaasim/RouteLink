import { apiClient } from "./api-client";
import type { Booking } from "@/types";

export const bookingService = {
  async createBooking(
    rideId: string,
    seatsBooked: number,
    token: string
  ): Promise<Booking> {
    return apiClient<Booking>("/bookings", {
      method: "POST",
      body: { rideId, seatsBooked },
      token,
    });
  },

  async getPassengerBookings(token: string): Promise<Booking[]> {
    return apiClient<Booking[]>("/bookings", {
      method: "GET",
      token,
    });
  },

  async getDriverBookings(token: string): Promise<Booking[]> {
    return apiClient<Booking[]>("/bookings/driver", {
      method: "GET",
      token,
    });
  },

  async acceptBooking(id: string, token: string): Promise<Booking> {
    return apiClient<Booking>(`/bookings/${id}/status`, {
      method: "PATCH",
      body: { status: "accepted" },
      token,
    });
  },

  async rejectBooking(id: string, token: string): Promise<Booking> {
    return apiClient<Booking>(`/bookings/${id}/status`, {
      method: "PATCH",
      body: { status: "rejected" },
      token,
    });
  },

  async cancelBooking(id: string, token: string): Promise<Booking> {
    return apiClient<Booking>(`/bookings/${id}/status`, {
      method: "PATCH",
      body: { status: "cancelled" },
      token,
    });
  },
};
