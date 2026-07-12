"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, User, Map, Shield, Moon, Monitor, Sun, Loader2, Camera, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { updateUserSettings, deleteUserAccount } from "@/actions/user";
import { getPresignedUrlAction } from "@/actions/storage";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Tab = "account" | "notifications" | "location" | "privacy" | "appearance";

interface UserSettingsProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    location: string | null;
    emailNotifications: boolean;
    pushNotifications: boolean;
    locationTracking: boolean;
    publicProfile: boolean;
    avatar: string | null;
  };
}

export default function SettingsClient({ user }: UserSettingsProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab") as Tab;

  const validTabs: Tab[] = ["account", "notifications", "location", "privacy", "appearance"];
  const initialTab = validTabs.includes(tabQuery) ? tabQuery : "account";

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Settings state
  const [name, setName] = useState(user.name || "");
  const [locationStr, setLocationStr] = useState(user.location || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session, update: updateSession } = useSession();
  
  const [settings, setSettings] = useState({
    emailNotifications: user.emailNotifications,
    pushNotifications: user.pushNotifications,
    locationTracking: user.locationTracking,
    publicProfile: user.publicProfile,
  });

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    router.push(`/settings?tab=${tab}`);
  };

  const handleToggle = async (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));
    
    // Auto-save toggle preferences
    try {
      const res = await updateUserSettings({ [key]: newValue });
      if (!res.success) throw new Error(res.error);
      toast.success("Your settings have been saved successfully.");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update preference.");
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: !newValue }));
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Display name cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await updateUserSettings({ name });
      if (res.success) {
        toast.success("Your display name has been updated successfully.");
        await updateSession({ name });
        router.refresh();
      } else {
        throw new Error(res.error);
      }
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    let finalUrl = '';

    try {
      const presignedRes = await getPresignedUrlAction({
        fileType: file.type,
        fileSize: file.size,
        folder: 'avatars',
      });

      if (presignedRes.success && presignedRes.data) {
        const { presignedUrl, publicUrl } = presignedRes.data;
        try {
          const uploadRes = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });

          if (!uploadRes.ok) throw new Error('S3 upload failed');
          finalUrl = publicUrl;
        } catch (s3Error) {
          console.warn('S3 upload failed, falling back to Base64', s3Error);
          finalUrl = await fileToBase64(file);
        }
      } else {
        console.warn('No presigned URL, falling back to Base64');
        finalUrl = await fileToBase64(file);
      }

      // Update Database
      const res = await updateUserSettings({ avatar: finalUrl });
      if (res.success) {
        setAvatarUrl(finalUrl);
        await updateSession({ image: finalUrl });
        toast.success('Profile photo updated successfully!');
        router.refresh();
      } else {
        throw new Error(res.error);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload profile photo.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploadingPhoto(true);
    try {
      const res = await updateUserSettings({ avatar: null });
      if (res.success) {
        setAvatarUrl('');
        await updateSession({ image: null });
        toast.success('Profile photo removed.');
        router.refresh();
      } else {
        throw new Error(res.error);
      }
    } catch (error) {
      toast.error('Failed to remove photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSaveLocation = async () => {
    setIsLoading(true);
    try {
      const res = await updateUserSettings({ location: locationStr });
      if (res.success) {
        toast.success("Your preferred location has been updated successfully.");
        router.refresh();
      } else {
        throw new Error(res.error);
      }
    } catch (error) {
      toast.error("Failed to update location.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteUserAccount();
      if (res.success) {
        toast.success("Your account has been permanently deleted.");
        await signOut({ callbackUrl: "/" });
      } else {
        throw new Error(res.error);
      }
    } catch (error) {
      toast.error("Failed to delete account.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 md:py-12 px-4 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar border-b md:border-b-0 md:border-r pr-0 md:pr-4">
          <Button 
            variant={activeTab === "account" ? "secondary" : "ghost"} 
            className="justify-start shrink-0"
            onClick={() => handleTabChange("account")}
          >
            <User className="mr-2 h-4 w-4" /> Account
          </Button>
          <Button 
            variant={activeTab === "notifications" ? "secondary" : "ghost"} 
            className="justify-start shrink-0"
            onClick={() => handleTabChange("notifications")}
          >
            <Bell className="mr-2 h-4 w-4" /> Notifications
          </Button>
          <Button 
            variant={activeTab === "location" ? "secondary" : "ghost"} 
            className="justify-start shrink-0"
            onClick={() => handleTabChange("location")}
          >
            <Map className="mr-2 h-4 w-4" /> Location
          </Button>
          <Button 
            variant={activeTab === "privacy" ? "secondary" : "ghost"} 
            className="justify-start shrink-0"
            onClick={() => handleTabChange("privacy")}
          >
            <Shield className="mr-2 h-4 w-4" /> Privacy
          </Button>
          <Button 
            variant={activeTab === "appearance" ? "secondary" : "ghost"} 
            className="justify-start shrink-0"
            onClick={() => handleTabChange("appearance")}
          >
            <Sun className="mr-2 h-4 w-4" /> Appearance
          </Button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3 space-y-8 pl-0 md:pl-2">
          
          {/* Account Section */}
          {activeTab === "account" && (
            <div className="space-y-8 animate-in fade-in">
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Profile Details</h2>
                  <p className="text-sm text-muted-foreground">Update your public facing display name.</p>
                </div>
                <Separator />
                
                <div className="flex items-center gap-6 py-4">
                  <Avatar className="h-24 w-24 border">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="Profile Photo" className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {name ? name.charAt(0).toUpperCase() : <User className="h-10 w-10" />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="space-y-3 flex-1">
                    <h3 className="text-sm font-medium">Profile Photo</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handlePhotoUpload} 
                        accept="image/jpeg,image/png,image/webp" 
                        className="hidden" 
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                      >
                        {isUploadingPhoto ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                        {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                      
                      {avatarUrl && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={handleRemovePhoto}
                          disabled={isUploadingPhoto}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: Square JPG, PNG, or WEBP, at least 400x400px.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={user.email} disabled />
                  </div>
                </div>
                <Button 
                  className="rounded-full px-6" 
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </section>

              {/* Danger Zone */}
              <section className="space-y-4 pt-6">
                <div>
                  <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
                  <p className="text-sm text-muted-foreground">Irreversible actions for your account.</p>
                </div>
                <Separator className="bg-destructive/20" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-base text-destructive">Delete Account</Label>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all your data.</p>
                  </div>
                  <Dialog>
                    <DialogTrigger
                      render={
                        <Button variant="destructive" className="rounded-full px-6 shadow-sm shrink-0" />
                      }
                    >
                      Delete Account
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove your data from our servers.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose render={<Button variant="outline" className="mt-2 sm:mt-0" />}>
                          Cancel
                        </DialogClose>
                        <Button 
                          onClick={handleDeleteAccount}
                          variant="destructive"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete Account"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </section>
            </div>
          )}

          {/* Notifications Section */}
          {activeTab === "notifications" && (
            <div className="space-y-8 animate-in fade-in">
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Notification Preferences</h2>
                  <p className="text-sm text-muted-foreground">Manage how and when you receive notifications.</p>
                </div>
                <Separator />
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly digests and updates via email.</p>
                    </div>
                    <Switch 
                      checked={settings.emailNotifications} 
                      onCheckedChange={() => handleToggle('emailNotifications')}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified immediately when someone interacts with your posts.</p>
                    </div>
                    <Switch 
                      checked={settings.pushNotifications} 
                      onCheckedChange={() => handleToggle('pushNotifications')}
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Location Section */}
          {activeTab === "location" && (
            <div className="space-y-8 animate-in fade-in">
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Location Settings</h2>
                  <p className="text-sm text-muted-foreground">Manage your location preferences for personalized content.</p>
                </div>
                <Separator />
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Preferred Location / Region</Label>
                      <Input 
                        id="location" 
                        value={locationStr} 
                        onChange={(e) => setLocationStr(e.target.value)} 
                        placeholder="e.g. Mumbai, Maharashtra"
                      />
                      <p className="text-xs text-muted-foreground">This helps us show you relevant gems near you.</p>
                    </div>
                    <Button 
                      className="rounded-full px-6" 
                      onClick={handleSaveLocation}
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Location
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Location Services</Label>
                      <p className="text-sm text-muted-foreground">Allow LocalAtlas to use your location for nearby gems.</p>
                    </div>
                    <Switch 
                      checked={settings.locationTracking} 
                      onCheckedChange={() => handleToggle('locationTracking')}
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Privacy Section */}
          {activeTab === "privacy" && (
            <div className="space-y-8 animate-in fade-in">
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Privacy Controls</h2>
                  <p className="text-sm text-muted-foreground">Manage who can see your profile and activity.</p>
                </div>
                <Separator />
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
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
            </div>
          )}

          {/* Appearance Section */}
          {activeTab === "appearance" && (
            <div className="space-y-8 animate-in fade-in">
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Appearance</h2>
                  <p className="text-sm text-muted-foreground">Customize how LocalAtlas looks on your device.</p>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Theme Interface</Label>
                    <p className="text-sm text-muted-foreground">Select your preferred color theme.</p>
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
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
