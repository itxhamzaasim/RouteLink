import { apiClient } from "./api-client";
import type { Ride, Booking, RideRequest } from "@/types";

export interface HistoryData {
  rides?: Ride[];
  bookings?: Booking[];
  requests?: RideRequest[];
}

export const historyService = {
  async getHistory(token: string): Promise<HistoryData> {
    return apiClient<HistoryData>("/history", {
      method: "GET",
      token,
    });
  },
};
