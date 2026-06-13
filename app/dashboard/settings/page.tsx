import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Settings",
};

const SETTINGS_SECTIONS = [
  {
    title: "Notifications",
    items: [
      { label: "Ride reminders", description: "Get notified before your trips" },
      { label: "Booking updates", description: "Status changes on your bookings" },
      { label: "Marketing emails", description: "Promotions and news from RouteLink" },
    ],
  },
  {
    title: "Privacy",
    items: [
      { label: "Show profile to drivers", description: "Let drivers see your profile" },
      { label: "Share ride history", description: "Display past trips on profile" },
    ],
  },
] as const;

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="mt-1 text-neutral-500">
          Manage your account preferences
        </p>
      </div>

      {SETTINGS_SECTIONS.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.items.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4"
              >
                <div>
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <p className="text-xs text-neutral-500">{item.description}</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="size-4 rounded border-neutral-300 text-brand-600"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg text-red-600">Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-600">
            Permanently delete your account and all associated data.
          </p>
          <Button variant="destructive" className="mt-4">
            Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
