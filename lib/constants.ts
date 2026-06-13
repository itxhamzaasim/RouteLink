export const APP_NAME = "RouteLink";
export const APP_TAGLINE = "Share rides. Save money. Go further.";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  dashboardRides: "/dashboard/rides",
  dashboardBookings: "/dashboard/bookings",
  dashboardMessages: "/dashboard/messages",
  dashboardCommunity: "/dashboard/community",
  dashboardProfile: "/dashboard/profile",
  dashboardSettings: "/dashboard/settings",
  dashboardSearch: "/dashboard/search",
  dashboardHistory: "/dashboard/history",
  dashboardActivity: "/dashboard/activity",
} as const;

export const AUTH_COOKIE_NAME = "routelink-session";
export const AUTH_STORAGE_KEY = "routelink-auth";

export const NAV_LINKS = [
  { label: "Find a ride", href: "#search" },
  { label: "Offer a ride", href: "#offer" },
  { label: "How it works", href: "#how-it-works" },
] as const;

export const DASHBOARD_NAV = [
  { label: "Overview", href: ROUTES.dashboard, icon: "LayoutDashboard" },
  { label: "Search Rides", href: ROUTES.dashboardSearch, icon: "Search" },
  { label: "Activity Feed", href: ROUTES.dashboardActivity, icon: "Bell" },
  { label: "Rides", href: ROUTES.dashboardRides, icon: "Car" },
  { label: "History", href: ROUTES.dashboardHistory, icon: "History" },
  { label: "Messages", href: ROUTES.dashboardMessages, icon: "MessageSquareMore" },
  { label: "Community", href: ROUTES.dashboardCommunity, icon: "MessageSquare" },
  { label: "Profile", href: ROUTES.dashboardProfile, icon: "User" },
  { label: "Settings", href: ROUTES.dashboardSettings, icon: "Settings" },
] as const;



