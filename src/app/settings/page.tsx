"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, User, Map, Shield, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { theme, setTheme } = useTheme();

  // Mock settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    locationTracking: true,
    publicProfile: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="container max-w-4xl py-8 md:py-12 px-4 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav (Mobile top, Desktop left) */}
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
          <Button variant="secondary" className="justify-start shrink-0">
            <User className="mr-2 h-4 w-4" /> Account
          </Button>
          <Button variant="ghost" className="justify-start shrink-0 text-muted-foreground">
            <Bell className="mr-2 h-4 w-4" /> Notifications
          </Button>
          <Button variant="ghost" className="justify-start shrink-0 text-muted-foreground">
            <Map className="mr-2 h-4 w-4" /> Location
          </Button>
          <Button variant="ghost" className="justify-start shrink-0 text-muted-foreground">
            <Shield className="mr-2 h-4 w-4" /> Privacy
          </Button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3 space-y-8">
          
          {/* Profile Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Profile Details</h2>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" defaultValue={user?.name || "Local Explorer"} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={user?.email || "explorer@localatlas.com"} disabled />
              </div>
            </div>
            <Button className="rounded-full px-6">Save Changes</Button>
          </section>

          {/* Preferences Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Preferences</h2>
            <Separator />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly digests and updates via email.</p>
                </div>
                <Switch 
                  checked={settings.emailNotifications} 
                  onCheckedChange={() => handleToggle('emailNotifications')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified immediately when someone interacts with your posts.</p>
                </div>
                <Switch 
                  checked={settings.pushNotifications} 
                  onCheckedChange={() => handleToggle('pushNotifications')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Location Services</Label>
                  <p className="text-sm text-muted-foreground">Allow LocalAtlas to use your location for nearby gems.</p>
                </div>
                <Switch 
                  checked={settings.locationTracking} 
                  onCheckedChange={() => handleToggle('locationTracking')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Make your profile and contributions visible to everyone.</p>
                </div>
                <Switch 
                  checked={settings.publicProfile} 
                  onCheckedChange={() => handleToggle('publicProfile')}
                />
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Appearance</h2>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Theme Interface</Label>
                <p className="text-sm text-muted-foreground">Customize how LocalAtlas looks on your device.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setTheme('light')}
                  className="rounded-full"
                >
                  <Sun className="h-4 w-4 mr-2" /> Light
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setTheme('dark')}
                  className="rounded-full"
                >
                  <Moon className="h-4 w-4 mr-2" /> Dark
                </Button>
                <Button 
                  variant={theme === 'system' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setTheme('system')}
                  className="rounded-full"
                >
                  <Monitor className="h-4 w-4 mr-2" /> System
                </Button>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="space-y-4 pt-6">
            <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
            <Separator className="bg-destructive/20" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base text-destructive">Delete Account</Label>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all your data.</p>
              </div>
              <Button variant="destructive" className="rounded-full px-6 shadow-sm">
                Delete Account
              </Button>
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}

function Sun({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
    </svg>
  );
}
