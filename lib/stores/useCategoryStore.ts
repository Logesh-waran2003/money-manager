import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface Category {
  id: string;
  name: string;
  type: string;
  color?: string;
  icon?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  subCategories?: Category[];
}

interface CategoryStore {
  currentCategory: Category | null;
  setCurrentCategory: (category: Category | null) => void;
  resetCurrentCategory: () => void;
}

// API functions
const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch('/api/categories');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch categories');
  }
  return response.json();
};

const fetchCategory = async (id: string): Promise<Category> => {
  const response = await fetch(`/api/categories/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch category');
  }
  return response.json();
};

const createCategory = async (category: Partial<Category>): Promise<Category> => {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create category');
  }
  
  return response.json();
};

const updateCategory = async (category: Partial<Category> & { id: string }): Promise<Category> => {
  const response = await fetch(`/api/categories/${category.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update category');
  }
  
  return response.json();
};

const deleteCategory = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete category');
  }
  
  return response.json();
};

// React Query hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => fetchCategory(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', data.id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Zustand store for local state
export const useCategoryStore = create<CategoryStore>((set) => ({
  currentCategory: null,
  setCurrentCategory: (category) => set({ currentCategory: category }),
  resetCurrentCategory: () => set({ currentCategory: null }),
}));
