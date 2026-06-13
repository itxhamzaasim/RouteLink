import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Create account",
  description: "Join RouteLink and start sharing rides today",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join millions of riders and drivers on RouteLink"
      alternateText="Already have an account?"
      alternateHref={ROUTES.login}
      alternateLabel="Sign in"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
