
import React, { useState } from "react";
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
import { User, Bell, Shield, Volume, Language, CreditCard, Download, Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(null);

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

  const handleSaveProfile = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
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

  const handleSaveLanguage = () => {
    toast({
      title: "Language preferences saved",
      description: "Your language settings have been updated.",
    });
  };

  const handleSavePayments = () => {
    toast({
      title: "Payment settings saved",
      description: "Your payment information has been updated.",
    });
  };

  const handleSaveData = () => {
    toast({
      title: "Data settings saved",
      description: "Your data permissions have been updated.",
    });
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
                  <TabsTrigger value="language" className="justify-start w-full">
                    <Language className="mr-2 h-4 w-4" />
                    Language & Content
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="justify-start w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payments & Subscriptions
                  </TabsTrigger>
                  <TabsTrigger value="data" className="justify-start w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Data & Permissions
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
                          <Input id="username" defaultValue={user.username} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input id="fullName" placeholder="Your full name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" defaultValue={user.email} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea id="bio" placeholder="Tell us a bit about yourself" />
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
                      <h3 className="text-lg font-medium">Social Media Accounts</h3>
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input id="twitter" placeholder="Your Twitter username" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input id="instagram" placeholder="Your Instagram username" />
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
                              <AlertDialogAction>Deactivate</AlertDialogAction>
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
                              <AlertDialogAction>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveProfile}>Save Changes</Button>
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
                          <Label htmlFor="room-invites">Room Invites</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications when someone invites you to a room</p>
                        </div>
                        <Switch id="room-invites" defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="followed-speakers">Followed Speakers Going Live</Label>
                          <p className="text-sm text-muted-foreground">Get notified when someone you follow starts speaking</p>
                        </div>
                        <Switch id="followed-speakers" defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="community-updates">Community Activity Updates</Label>
                          <p className="text-sm text-muted-foreground">Get notified about activity in your communities</p>
                        </div>
                        <Switch id="community-updates" defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="mentions">Mentions in Conversations</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications when you're mentioned in a conversation</p>
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
                      <h3 className="text-lg font-medium">Who Can Follow You</h3>
                      <div className="space-y-2">
                        <Label htmlFor="follow-permissions">Set who can follow your account</Label>
                        <Select defaultValue="everyone">
                          <SelectTrigger id="follow-permissions">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="everyone">Everyone</SelectItem>
                            <SelectItem value="verified">Verified Users Only</SelectItem>
                            <SelectItem value="approved">Only People You Approve</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Blocked Users</h3>
                      <p className="text-sm text-muted-foreground">
                        You haven't blocked any users yet. Blocked users won't be able to follow you or interact with your content.
                      </p>
                      <Button variant="outline">Manage Blocked Users</Button>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Room Invitations</h3>
                      <div className="space-y-2">
                        <Label htmlFor="room-invites-privacy">Who can invite you to rooms</Label>
                        <Select defaultValue="anyone">
                          <SelectTrigger id="room-invites-privacy">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="anyone">Anyone</SelectItem>
                            <SelectItem value="following">People I Follow</SelectItem>
                            <SelectItem value="none">No One</SelectItem>
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
                          <p className="text-sm text-muted-foreground">Only receive messages from people you follow</p>
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

              <TabsContent value="language" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Language & Content Preferences</CardTitle>
                    <CardDescription>
                      Customize your content experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Language Settings</h3>
                      <div className="space-y-2">
                        <Label htmlFor="default-language">Set your default language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger id="default-language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                            <SelectItem value="ko">Korean</SelectItem>
                            <SelectItem value="zh">Chinese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Content Preferences</h3>
                      <p className="text-sm text-muted-foreground">
                        Select topics you're interested in to get better recommendations
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <Button variant="outline" className="justify-start">
                          <span className="h-4 w-4 mr-2 rounded-full bg-primary"></span>
                          Technology
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <span className="h-4 w-4 mr-2 rounded-full bg-primary"></span>
                          Science
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <span className="h-4 w-4 mr-2 rounded-full bg-primary"></span>
                          Politics
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <span className="h-4 w-4 mr-2 rounded-full bg-primary"></span>
                          Sports
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <span className="h-4 w-4 mr-2 rounded-full bg-primary"></span>
                          Entertainment
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <span className="h-4 w-4 mr-2 rounded-full bg-primary"></span>
                          Gaming
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveLanguage}>Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Payments & Subscriptions</CardTitle>
                    <CardDescription>
                      Manage your payment methods and subscriptions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Active Subscriptions</h3>
                      <p className="text-sm text-muted-foreground">
                        You don't have any active subscriptions
                      </p>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Transaction History</h3>
                      <p className="text-sm text-muted-foreground">
                        View your payment history
                      </p>
                      <div className="border rounded-md">
                        <div className="py-4 px-6 text-center text-muted-foreground">
                          No transactions found
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSavePayments}>Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Data & Permissions</CardTitle>
                    <CardDescription>
                      Manage your data and application permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Your Data</h3>
                      <p className="text-sm text-muted-foreground">
                        Download a copy of your data or request data deletion
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline">Download Your Data</Button>
                        <Button variant="outline" className="text-destructive">Request Data Deletion</Button>
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="location-settings">Location Services</Label>
                          <p className="text-sm text-muted-foreground">Allow app to access your location</p>
                        </div>
                        <Switch id="location-settings" />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="third-party-access">Third-Party App Access</Label>
                          <p className="text-sm text-muted-foreground">Control which apps can access your account</p>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveData}>Save Changes</Button>
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
