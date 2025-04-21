import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from '@/lib/axios';
import api from '@/lib/axios';
import axios from 'axios';

const Debug = () => {
  const [apiUrl, setApiUrl] = useState(API_URL);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testConnection = async (url: string, path: string) => {
    setError(null);
    setResponse(null);
    setLoading(true);

    try {
      const fullUrl = `${url}${path}`;
      console.log(`Testing connection to: ${fullUrl}`);
      
      const response = await axios.get(fullUrl, { timeout: 5000 });
      
      setResponse({
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      toast({
        title: "Connection successful",
        description: `Connected to ${fullUrl}`,
      });
    } catch (err: any) {
      console.error('Connection test error:', err);
      
      let errorMessage = "Unknown error";
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Server responded with status: ${err.response.status}`;
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = "No response received from server - it may be down or unreachable";
      } else {
        // Something happened in setting up the request
        errorMessage = err.message || "Unknown error";
      }
      
      setError(errorMessage);
      
      toast({
        title: "Connection failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectionTests = [
    { name: "Health Check", path: "/health" },
    { name: "Root", path: "/" },
    { name: "API Ping", path: "/api" },
  ];

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">API Connection Debug</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Connection Settings</CardTitle>
          <CardDescription>Test the connection to your backend API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">API URL</Label>
              <div className="flex gap-2">
                <Input 
                  id="apiUrl" 
                  value={apiUrl} 
                  onChange={(e) => setApiUrl(e.target.value)} 
                  placeholder="http://localhost:5000"
                  className="flex-1"
                />
                <Button 
                  onClick={() => setApiUrl(API_URL)}
                  variant="outline"
                >
                  Reset
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Current configured API URL: {API_URL}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-wrap gap-2">
          {connectionTests.map((test) => (
            <Button
              key={test.name}
              onClick={() => testConnection(apiUrl, test.path)}
              disabled={loading}
              variant="outline"
              className="mr-2"
            >
              Test {test.name}
            </Button>
          ))}
        </CardFooter>
      </Card>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardHeader className="text-destructive">
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">{error}</pre>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card className="mb-6 border-primary">
          <CardHeader className="text-primary">
            <CardTitle>Response</CardTitle>
            <CardDescription>
              Status: {response.status} {response.statusText}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Debug; 