import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCard } from "@/components/post/PostCard";
import { ArrowLeft, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  postCount: number;
  followersCount: number;
  followingCount: number;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  communityId: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
}

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      
      try {
        // Get all posts and filter by username
        const postsResponse = await api.get('/api/posts');
        const allPosts = postsResponse.data.data;
        
        // Find posts by this username
        const userPosts = allPosts.filter(
          (post: Post) => post.author?.username === username
        );
        
        if (userPosts.length === 0) {
          toast.error(`No posts found for user "${username}"`);
          setIsLoading(false);
          return;
        }
        
        // Get user data from the first post's author
        const postAuthor = userPosts[0].author;
        
        // Create user profile from author data
        const userProfile: UserProfile = {
          _id: postAuthor._id,
          username: postAuthor.username,
          email: "",  // Not available from posts
          bio: "",    // Not available from posts
          avatarUrl: postAuthor.avatarUrl,
          createdAt: userPosts[0].createdAt,  // Approximate from oldest post
          postCount: userPosts.length,
          followersCount: 0,  // Not available
          followingCount: 0   // Not available
        };
        
        setUser(userProfile);
        setPosts(userPosts);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">User not found</h3>
            <p className="text-muted-foreground mb-4">
              The user you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-2xl">
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{user.username}</h2>
                {user.bio && (
                  <p className="text-muted-foreground mt-2">{user.bio}</p>
                )}
                <div className="flex justify-center gap-4 mt-4">
                  <div className="text-center">
                    <p className="font-semibold">{user.postCount}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{user.followersCount}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{user.followingCount}</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Card>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Posts by {user.username}</h3>
            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map(post => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <User className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  {user.username} hasn't posted anything yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile; 