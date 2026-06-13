export type RideStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Location {
  address: string;
  city: string;
  lat?: number;
  lng?: number;
}

export interface RideSearchParams {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

export interface VehicleDetails {
  make: string;
  model: string;
  licensePlate: string;
  color?: string;
}

export interface Ride {
  id: string;
  driverId: string;
  driverName: string;
  driverRating: number;
  origin: Location;
  destination: Location;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  status: RideStatus;
  vehicleDetails: VehicleDetails;
}

export interface RideRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerRating: number;
  origin: Location;
  destination: Location;
  departureTime: string;
  seatsNeeded: number;
  proposedPrice: number;
  status: "pending" | "accepted" | "cancelled";
  driverId?: string | null;
  createdAt?: string;
}
