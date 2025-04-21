import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import axios from "axios";

// API base URL
const API_URL = "http://localhost:5000";

interface Community {
  _id: string;
  name: string;
}

const CreateDiscussion = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [isScheduled, setIsScheduled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Communities for dropdown selection
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user || !token) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to create a discussion",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [user, token, navigate, toast]);

  // Fetch communities
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setIsLoadingCommunities(true);
        const response = await axios.get(`${API_URL}/api/communities`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCommunities(response.data.data);
      } catch (error: any) {
        toast({
          title: "Error fetching communities",
          description: error.response?.data?.error || "Failed to load communities. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCommunities(false);
      }
    };

    if (token) {
      fetchCommunities();
    } else {
      setIsLoadingCommunities(false);
    }
  }, [token, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your discussion",
        variant: "destructive",
      });
      return;
    }

    if (!communityId) {
      toast({
        title: "Community required",
        description: "Please select a community for your discussion",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const discussionData = {
        title,
        description,
        communityId,
        isPrivate,
        startTime: startDate?.toISOString(),
        status: isScheduled ? "scheduled" : "active",
      };
      
      const response = await axios.post(
        `${API_URL}/api/discussions`, 
        discussionData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const responseData = response.data.data;
      
      toast({
        title: "Discussion created",
        description: isScheduled 
          ? "Your discussion has been scheduled successfully" 
          : "Your discussion has been created and is now live",
      });
      
      // Navigate to the new discussion
      if (isScheduled) {
        navigate("/discussions");
      } else {
        navigate(`/discussion/${responseData._id}`);
      }
      
    } catch (error: any) {
      toast({
        title: "Failed to create discussion",
        description: error.response?.data?.error || "An error occurred while creating the discussion",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-3xl py-6 animate-fade-in">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create a Discussion</h1>
          <p className="text-muted-foreground mt-1">
            Host a live audio conversation or schedule one for later
          </p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Discussion Details</CardTitle>
              <CardDescription>
                Provide information about your discussion
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title for your discussion"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What will you be discussing? Add details to help people decide if they want to join."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="community">Community</Label>
                {isLoadingCommunities ? (
                  <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span className="text-muted-foreground">Loading communities...</span>
                  </div>
                ) : (
                  <Select value={communityId} onValueChange={setCommunityId}>
                    <SelectTrigger id="community">
                      <SelectValue placeholder="Select a community" />
                    </SelectTrigger>
                    <SelectContent>
                      {communities.length > 0 ? (
                        communities.map((community) => (
                          <SelectItem key={community._id} value={community._id}>
                            r/{community.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No communities available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="private">Private Discussion</Label>
                  <p className="text-sm text-muted-foreground">
                    Only invited members can join this discussion
                  </p>
                </div>
                <Switch
                  id="private"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="scheduled">Schedule for later</Label>
                  <p className="text-sm text-muted-foreground">
                    Set a future time for this discussion
                  </p>
                </div>
                <Switch
                  id="scheduled"
                  checked={isScheduled}
                  onCheckedChange={setIsScheduled}
                />
              </div>
              
              {isScheduled && (
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP p") : <span>Pick a date & time</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => setStartDate(date || undefined)}
                          initialFocus
                        />
                        {/* Time picker would go here - simple implementation */}
                        <div className="p-3 border-t border-border">
                          <Label htmlFor="time">Time</Label>
                          <Input
                            id="time"
                            type="time"
                            className="mt-1"
                            onChange={(e) => {
                              if (startDate && e.target.value) {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(startDate);
                                newDate.setHours(parseInt(hours, 10));
                                newDate.setMinutes(parseInt(minutes, 10));
                                setStartDate(newDate);
                              }
                            }}
                            defaultValue={startDate ? `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}` : ""}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button"
                variant="outline"
                onClick={() => navigate("/discussions")}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || !title.trim() || !communityId}
              >
                {isSubmitting ? "Creating..." : isScheduled ? "Schedule Discussion" : "Start Discussion"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateDiscussion; 