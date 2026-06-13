"use client";

import { useAuthContext } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, logout } = useAuthContext();

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "RL";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
        <p className="mt-1 text-neutral-500">
          Manage your personal information
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-neutral-900 text-lg text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>
              {user?.firstName} {user?.lastName}
            </CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <Badge className="capitalize">{user?.role}</Badge>
              {user?.isVerified && (
                <Badge className="bg-brand-50 text-brand-700">Verified</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" defaultValue={user?.firstName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" defaultValue={user?.lastName} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user?.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" defaultValue={user?.phone} />
          </div>
          <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
            Save changes
          </Button>
        </CardContent>
      </Card>

      {/* Account actions section */}
      <Card className="border-red-200/60 bg-red-50/10 shadow-xs">
        <CardHeader>
          <CardTitle className="text-red-900 text-base font-semibold">Account Session</CardTitle>
          <p className="text-xs text-neutral-500 mt-1">
            Sign out of your active session. You will need to enter your password to log back in.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            onClick={() => logout()}
            className="bg-red-650 hover:bg-red-700 text-white font-medium shadow-sm transition-colors duration-250 cursor-pointer"
          >
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
