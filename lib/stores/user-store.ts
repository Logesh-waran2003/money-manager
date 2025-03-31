import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        
        setUser: (user) => set({ 
          user, 
          isAuthenticated: !!user 
        }),
        
        updateUser: (data) => 
          set((state) => ({
            user: state.user ? { ...state.user, ...data } : null
          })),
        
        login: async (email, password) => {
          set({ isLoading: true, error: null });
          
          try {
            // This is a placeholder for actual API call
            // In a real app, you would call your authentication API here
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Login failed');
            }
            
            const user = await response.json();
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Login failed', 
              isLoading: false 
            });
            throw error;
          }
        },
        
        logout: () => {
          // This is a placeholder for actual API call
          // In a real app, you would call your logout API here
          set({ 
            user: null, 
            isAuthenticated: false 
          });
        },
        
        register: async (name, email, password) => {
          set({ isLoading: true, error: null });
          
          try {
            // This is a placeholder for actual API call
            // In a real app, you would call your registration API here
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, password })
            });
            
            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Registration failed');
            }
            
            const user = await response.json();
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Registration failed', 
              isLoading: false 
            });
            throw error;
          }
        },
        
        setLoading: (isLoading) => set({ isLoading }),
        
        setError: (error) => set({ error })
      }),
      {
        name: 'user-store',
        partialize: (state) => ({ 
          user: state.user,
          isAuthenticated: state.isAuthenticated
        }),
      }
    )
  )
);
