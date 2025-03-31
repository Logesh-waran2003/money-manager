import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
}

interface CategoryState {
  categories: Category[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  selectCategory: (id: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Helpers
  getCategoriesByType: (type: CategoryType) => Category[];
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    persist(
      (set, get) => ({
        categories: [],
        selectedCategoryId: null,
        isLoading: false,
        error: null,
        
        setCategories: (categories) => set({ categories }),
        
        addCategory: (category) => 
          set((state) => ({ 
            categories: [...state.categories, category] 
          })),
        
        updateCategory: (id, data) => 
          set((state) => ({
            categories: state.categories.map((category) => 
              category.id === id ? { ...category, ...data } : category
            )
          })),
        
        deleteCategory: (id) => 
          set((state) => ({
            categories: state.categories.filter((category) => category.id !== id),
            selectedCategoryId: state.selectedCategoryId === id ? null : state.selectedCategoryId
          })),
        
        selectCategory: (id) => set({ selectedCategoryId: id }),
        
        setLoading: (isLoading) => set({ isLoading }),
        
        setError: (error) => set({ error }),
        
        getCategoriesByType: (type) => {
          return get().categories.filter(category => category.type === type);
        }
      }),
      {
        name: 'category-store',
        partialize: (state) => ({ 
          categories: state.categories,
          selectedCategoryId: state.selectedCategoryId
        }),
      }
    )
  )
);
