export interface BookingRideDetails {
  origin: {
    address: string;
    city: string;
  };
  destination: {
    address: string;
    city: string;
  };
  departureTime: string;
  driverName: string;
  driverId?: string;
}

export interface Booking {
  id: string;
  rideId: string;
  rideDetails: BookingRideDetails;
  passengerId: string;
  passengerName: string;
  seatsBooked: number;
  totalPrice: number;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
