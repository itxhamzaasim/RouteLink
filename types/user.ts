export type UserRole = "passenger" | "driver" | "admin";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  isVerified: boolean;
  vehicleType?: string;
  vehicleRegistration?: string;
  vehiclePhotos?: string[];
  drivingLicense?: string;
  isDriverApproved?: boolean;
  driverApplicationStatus?: "none" | "pending" | "approved" | "rejected";
  isSuspended?: boolean;
  isBanned?: boolean;
  createdAt: string;
}

export interface UserProfile extends User {
  rating?: number;
  totalTrips?: number;
  bio?: string;
}
