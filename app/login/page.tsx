import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your RouteLink account",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your rides and bookings"
      alternateText="Don't have an account?"
      alternateHref={ROUTES.register}
      alternateLabel="Sign up for free"
    >
      <LoginForm />
    </AuthLayout>
  );
}
