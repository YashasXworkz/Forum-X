
import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="text-9xl font-bold text-primary/20">404</div>
        <h1 className="text-4xl font-bold mt-4">Page Not Found</h1>
        <p className="text-muted-foreground mt-2 mb-8 text-center max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/communities">Explore Communities</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
