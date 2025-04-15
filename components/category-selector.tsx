"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryStore } from "@/lib/stores/category-store";

interface CategorySelectorProps {
  selectedCategory: string;
  onChange: (value: string) => void;
  type?: "income" | "expense" | "all";
  placeholder?: string;
  disabled?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onChange,
  type = "all",
  placeholder = "Select category",
  disabled = false,
}) => {
  const { categories, getCategoriesByType } = useCategoryStore();

  // Filter categories based on type
  const filteredCategories = React.useMemo(() => {
    if (type === "income") {
      return getCategoriesByType("income");
    } else if (type === "expense") {
      return getCategoriesByType("expense");
    }
    return categories;
  }, [categories, getCategoriesByType, type]);

  return (
    <Select
      value={selectedCategory}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {filteredCategories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategorySelector;
