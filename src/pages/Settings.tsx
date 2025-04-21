import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { User, Bell, Shield, Volume, Settings as SettingsIcon } from "lucide-react";
import axios from "axios";

// API base URL - update this to match your backend URL
const API_URL = "http://localhost:5000";

const Settings = () => {
  const { user, updateUser, logout, token } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setProfileImage(user.avatarUrl || null);
    }
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
          <h1 className="text-2xl font-semibold mb-4">Please log in to access settings</h1>
          <Button asChild>
            <a href="/login">Login</a>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSubmitting(true);
      
      // Create updated user data
      const userData = {
        username,
        email,
        bio,
        avatarUrl: profileImage
      };
      
      // Make API call to update profile
      const response = await axios.put(`${API_URL}/api/users/profile`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local user data
      updateUser(response.data.data);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to update profile";
      
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences saved",
      description: "Your notification settings have been updated.",
    });
  };

  const handleSavePrivacy = () => {
    toast({
      title: "Privacy settings saved",
      description: "Your privacy settings have been updated.",
    });
  };

  const handleSaveAudio = () => {
    toast({
      title: "Audio settings saved",
      description: "Your audio preferences have been updated.",
    });
  };

  const handleSaveRoom = () => {
    toast({
      title: "Room settings saved",
      description: "Your room preferences have been updated.",
    });
  };

  const handleDeactivateAccount = async () => {
    try {
      await axios.put(`${API_URL}/api/users/deactivate`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast({
        title: "Account deactivated",
        description: "Your account has been deactivated. You can reactivate it by logging in again.",
      });
      
      logout();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to deactivate account",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`${API_URL}/api/users/account`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      
      logout();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <div className="flex flex-col md:flex-row gap-6">
            <aside className="md:w-1/4">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0 w-full">
                  <TabsTrigger value="account" className="justify-start w-full">
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="justify-start w-full">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="justify-start w-full">
                    <Shield className="mr-2 h-4 w-4" />
                    Privacy & Safety
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="justify-start w-full">
                    <Volume className="mr-2 h-4 w-4" />
                    Audio & Voice
                  </TabsTrigger>
                  <TabsTrigger value="room" className="justify-start w-full">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Room & Community
                  </TabsTrigger>
                </TabsList>
              </ScrollArea>
            </aside>

            <div className="md:w-3/4">
              <TabsContent value="account" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Update your account details and public profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea 
                            id="bio" 
                            placeholder="Tell us a bit about yourself" 
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col items-center space-y-4">
                        <Label>Profile Photo</Label>
                        <Avatar className="h-32 w-32">
                          <AvatarImage src={profileImage || user.avatarUrl} />
                          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Label 
                          htmlFor="profileImage" 
                          className="cursor-pointer bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-md text-sm"
                        >
                          Upload Photo
                        </Label>
                        <Input 
                          id="profileImage" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">Deactivate Account</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Your account will be deactivated. You can reactivate it later by logging in.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeactivateAccount}>Deactivate</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete Account</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteAccount}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="room-invites">Item Requests</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications when someone requests to borrow your items</p>
                        </div>
                        <Switch id="room-invites" defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="followed-speakers">Request Status Updates</Label>
                          <p className="text-sm text-muted-foreground">Get notified when the status of your requests changes</p>
                        </div>
                        <Switch id="followed-speakers" defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="community-updates">Community Activity Updates</Label>
                          <p className="text-sm text-muted-foreground">Get notified about new items in your community</p>
                        </div>
                        <Switch id="community-updates" defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="mentions">Messages</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications for new messages</p>
                        </div>
                        <Switch id="mentions" defaultChecked />
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notification Frequency</h3>
                      <div className="space-y-2">
                        <Label htmlFor="notification-frequency">How often would you like to receive notifications?</Label>
                        <Select defaultValue="normal">
                          <SelectTrigger id="notification-frequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="frequent">Frequent - Get all notifications</SelectItem>
                            <SelectItem value="normal">Normal - Only important notifications</SelectItem>
                            <SelectItem value="infrequent">Infrequent - Minimal notifications</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveNotifications}>Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy & Safety</CardTitle>
                    <CardDescription>
                      Manage your privacy settings and controls
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Who Can Contact You</h3>
                      <div className="space-y-2">
                        <Label htmlFor="follow-permissions">Set who can send you messages</Label>
                        <Select defaultValue="everyone">
                          <SelectTrigger id="follow-permissions">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="everyone">Everyone</SelectItem>
                            <SelectItem value="verified">Verified Users Only</SelectItem>
                            <SelectItem value="approved">Only People You've Interacted With</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Blocked Users</h3>
                      <p className="text-sm text-muted-foreground">
                        You haven't blocked any users yet. Blocked users won't be able to request your items or send you messages.
                      </p>
                      <Button variant="outline">Manage Blocked Users</Button>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Item Request Permissions</h3>
                      <div className="space-y-2">
                        <Label htmlFor="room-invites-privacy">Who can request to borrow your items</Label>
                        <Select defaultValue="anyone">
                          <SelectTrigger id="room-invites-privacy">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="anyone">Anyone</SelectItem>
                            <SelectItem value="verified">Verified Users Only</SelectItem>
                            <SelectItem value="none">No One (Temporarily Disable Lending)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="hide-activity">Hide Activity Status</Label>
                          <p className="text-sm text-muted-foreground">Hide when you're online from others</p>
                        </div>
                        <Switch id="hide-activity" />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="restrict-messages">Restrict Messages</Label>
                          <p className="text-sm text-muted-foreground">Only receive messages from people who have borrowed from you</p>
                        </div>
                        <Switch id="restrict-messages" />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSavePrivacy}>Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audio" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Audio & Voice Settings</CardTitle>
                    <CardDescription>
                      Customize your audio experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Audio Quality</h3>
                      <div className="space-y-2">
                        <Label htmlFor="audio-quality">Select your preferred audio quality</Label>
                        <Select defaultValue="normal">
                          <SelectTrigger id="audio-quality">
                            <SelectValue placeholder="Select quality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low (Saves data)</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High (Best quality)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="spatial-audio">Spatial Audio</Label>
                          <p className="text-sm text-muted-foreground">Enable for a more immersive audio experience</p>
                        </div>
                        <Switch id="spatial-audio" />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="voice-isolation">Voice Isolation</Label>
                          <p className="text-sm text-muted-foreground">Reduce background noise when you speak</p>
                        </div>
                        <Switch id="voice-isolation" defaultChecked />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveAudio}>Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="room" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Room & Community Settings</CardTitle>
                    <CardDescription>
                      Manage how you interact with rooms and communities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Room Creation Permissions</h3>
                      <div className="space-y-2">
                        <Label htmlFor="room-start-permissions">Who can start rooms with you</Label>
                        <Select defaultValue="everyone">
                          <SelectTrigger id="room-start-permissions">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="everyone">Everyone</SelectItem>
                            <SelectItem value="followers">Followers</SelectItem>
                            <SelectItem value="none">No One</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Communities</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage communities you own or are a member of
                      </p>
                      <Button variant="outline">Manage Communities</Button>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="room-replays">Room Replays</Label>
                          <p className="text-sm text-muted-foreground">Allow rooms you host to be recorded and replayed</p>
                        </div>
                        <Switch id="room-replays" defaultChecked />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveRoom}>Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
