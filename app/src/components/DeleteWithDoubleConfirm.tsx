"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteWithDoubleConfirmProps {
  id: number;
  action: (id: number) => Promise<{ success: boolean; error?: string }>;
  itemDescription?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export default function DeleteWithDoubleConfirm({ 
  id, 
  action, 
  itemDescription = "item",
  size = "sm",
  variant = "ghost",
  className = ""
}: DeleteWithDoubleConfirmProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClick = () => {
    setErrorMsg(null);
    const confirmed = window.confirm(`Are you sure you want to delete this ${itemDescription}? This action cannot be undone.`);
    if (confirmed) {
      startTransition(async () => {
        try {
          const res = await action(id);
          if (res && !res.success) {
            setErrorMsg(res.error || `Failed to delete ${itemDescription}`);
          }
        } catch (error: any) {
          setErrorMsg(error.message || "An unexpected error occurred");
        }
      });
    }
  };

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center gap-1">
        <Button 
          variant="destructive" 
          size={size} 
          disabled 
          className={`h-7 text-[10px] bg-red-100 text-red-700 border border-red-200 ${className}`}
        >
          <AlertCircle className="w-3 h-3 mr-1" />
          Failed
        </Button>
        <span className="text-[10px] text-red-500 max-w-[120px] text-center leading-tight truncate" title={errorMsg}>
          {errorMsg}
        </span>
      </div>
    );
  }

  if (isPending) {
    return (
      <Button variant="outline" size={size} disabled className={`h-7 ${className}`}>
        <Loader2 className="w-3 h-3 animate-spin mr-1" />
        Deleting...
      </Button>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleClick}
      className={`h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
      title={`Delete ${itemDescription}`}
    >
      <Trash2 className="w-3 h-3" />
      <span className="sr-only">Delete</span>
    </Button>
  );
}
