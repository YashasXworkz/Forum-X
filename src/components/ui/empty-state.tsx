import React from "react";
import { Button } from "./button";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLink?: string;
  actionLabel?: string;
  showAction?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLink = "/",
  actionLabel = "Action",
  showAction = true,
}) => {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 mb-4 opacity-50" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">
        {description}
      </p>
      {showAction && (
        <Button asChild>
          <Link to={actionLink}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}; 