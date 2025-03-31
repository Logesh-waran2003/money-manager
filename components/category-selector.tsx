"use client";

import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tag, ShoppingCart, Home, Car, Utensils, Briefcase, Gift, Plane, HeartPulse, Laptop, Dumbbell, Sparkles } from "lucide-react";

interface CategorySelectorProps {
  selectedCategory: string;
  onChange: (value: string) => void;
  label?: string;
}

// List of common transaction categories
const categories = [
  { id: "food", name: "Food & Dining", icon: <Utensils className="h-4 w-4 mr-2" /> },
  { id: "shopping", name: "Shopping", icon: <ShoppingCart className="h-4 w-4 mr-2" /> },
  { id: "housing", name: "Housing", icon: <Home className="h-4 w-4 mr-2" /> },
  { id: "transportation", name: "Transportation", icon: <Car className="h-4 w-4 mr-2" /> },
  { id: "entertainment", name: "Entertainment", icon: <Sparkles className="h-4 w-4 mr-2" /> },
  { id: "health", name: "Health & Medical", icon: <HeartPulse className="h-4 w-4 mr-2" /> },
  { id: "personal", name: "Personal Care", icon: <Dumbbell className="h-4 w-4 mr-2" /> },
  { id: "education", name: "Education", icon: <Laptop className="h-4 w-4 mr-2" /> },
  { id: "gifts", name: "Gifts & Donations", icon: <Gift className="h-4 w-4 mr-2" /> },
  { id: "travel", name: "Travel", icon: <Plane className="h-4 w-4 mr-2" /> },
  { id: "income", name: "Income", icon: <Briefcase className="h-4 w-4 mr-2" /> },
  { id: "other", name: "Other", icon: <Tag className="h-4 w-4 mr-2" /> },
];

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  selectedCategory, 
  onChange, 
  label = "Category" 
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select value={selectedCategory} onValueChange={onChange}>
        <SelectTrigger className="border-input bg-background transition-colors hover:bg-accent/10 focus:ring-2 focus:ring-ring">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {categories.map((category) => (
            <SelectItem 
              key={category.id} 
              value={category.id}
              className="cursor-pointer transition-colors hover:bg-accent/10"
            >
              <div className="flex items-center">
                {category.icon}
                {category.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelector;
