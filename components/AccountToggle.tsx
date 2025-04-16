"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useAccountStore } from "@/lib/stores/account-store";

export function AccountToggle() {
  // Local state to force re-renders
  const [, setForceUpdate] = useState(0);
  
  // Get the current state from the store
  const showInactive = useAccountStore(state => state.showInactive);
  const toggleInactiveAccounts = useAccountStore(state => state.toggleInactiveAccounts);
  
  // Handle toggle with forced re-render
  const handleToggle = () => {
    toggleInactiveAccounts();
    setForceUpdate(prev => prev + 1);
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="show-inactive" 
        checked={showInactive}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="show-inactive" className="cursor-pointer">
        {showInactive ? <Eye className="h-4 w-4 mr-1 inline" /> : <EyeOff className="h-4 w-4 mr-1 inline" />}
        {showInactive ? "Showing all accounts" : "Showing active accounts only"}
      </Label>
    </div>
  );
}
