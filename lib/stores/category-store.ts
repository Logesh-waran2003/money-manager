import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryStore {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCategories: () => Promise<void>;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Computed
  getCategoriesByType: (type: CategoryType) => Category[];
}

// Default categories
const defaultCategories: Category[] = [
  // Income categories
  {
    id: 'income-salary',
    name: 'Salary',
    type: 'income',
    color: '#4CAF50',
    icon: 'briefcase',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'income-freelance',
    name: 'Freelance',
    type: 'income',
    color: '#2196F3',
    icon: 'code',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'income-investments',
    name: 'Investments',
    type: 'income',
    color: '#9C27B0',
    icon: 'trending-up',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'income-gifts',
    name: 'Gifts',
    type: 'income',
    color: '#E91E63',
    icon: 'gift',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'income-other',
    name: 'Other Income',
    type: 'income',
    color: '#607D8B',
    icon: 'plus-circle',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  
  // Expense categories
  {
    id: 'expense-housing',
    name: 'Housing',
    type: 'expense',
    color: '#FF5722',
    icon: 'home',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'expense-food',
    name: 'Food & Dining',
    type: 'expense',
    color: '#FF9800',
    icon: 'utensils',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'expense-transportation',
    name: 'Transportation',
    type: 'expense',
    color: '#795548',
    icon: 'car',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'expense-utilities',
    name: 'Utilities',
    type: 'expense',
    color: '#607D8B',
    icon: 'zap',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'expense-entertainment',
    name: 'Entertainment',
    type: 'expense',
    color: '#9C27B0',
    icon: 'film',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'expense-shopping',
    name: 'Shopping',
    type: 'expense',
    color: '#2196F3',
    icon: 'shopping-bag',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'expense-health',
    name: 'Health & Medical',
    type: 'expense',
    color: '#F44336',
    icon: 'activity',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'expense-personal',
    name: 'Personal Care',
    type: 'expense',
    color: '#E91E63',
    icon: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'expense-education',
    name: 'Education',
    type: 'expense',
    color: '#3F51B5',
    icon: 'book',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'expense-other',
    name: 'Other Expenses',
    type: 'expense',
    color: '#607D8B',
    icon: 'more-horizontal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useCategoryStore = create<CategoryStore>()(
  devtools(
    persist(
      (set, get) => ({
        categories: defaultCategories,
        isLoading: false,
        error: null,

        fetchCategories: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('/api/categories');
            
            if (!response.ok) {
              throw new Error('Failed to fetch categories');
            }
            
            const data = await response.json();
            
            // If we got data from the API, use it
            if (data && data.length > 0) {
              set({ categories: data, isLoading: false });
            } else {
              // Otherwise keep using the default categories
              set({ isLoading: false });
            }
          } catch (error) {
            console.error('Error fetching categories:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch categories', 
              isLoading: false 
            });
          }
        },

        addCategory: (category) => {
          set((state) => ({
            categories: [...state.categories, category],
          }));
        },

        updateCategory: (id, data) => {
          set((state) => ({
            categories: state.categories.map((category) =>
              category.id === id
                ? { ...category, ...data, updatedAt: new Date().toISOString() }
                : category
            ),
          }));
        },

        deleteCategory: (id) => {
          set((state) => ({
            categories: state.categories.filter((category) => category.id !== id),
          }));
        },
        
        getCategoriesByType: (type) => {
          return get().categories.filter(category => category.type === type);
        },
      }),
      {
        name: 'category-store',
      }
    )
  )
);
