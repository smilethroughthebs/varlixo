/**
 * ==============================================
 * VARLIXO - GLOBAL STATE STORE
 * ==============================================
 * Zustand store for application state management.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

// User interface
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  country?: string;
  occupation?: string;
  annualIncomeRange?: string;
  sourceOfFunds?: string;
  investmentExperience?: string;
  role: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  kycStatus: string;
  avatar?: string;
  theme: string;
  preferredLanguage: string;
  preferredCurrency?: string;
  referralCode?: string;
}

// Wallet interface
interface Wallet {
  mainBalance: number;
  pendingBalance: number;
  lockedBalance: number;
  totalEarnings: number;
  referralEarnings: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

// Auth store interface
interface AuthState {
  user: User | null;
  wallet: Wallet | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setWallet: (wallet: Wallet | null) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateWallet: (updates: Partial<Wallet>) => void;
}

// Create auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      wallet: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setWallet: (wallet) => set({ wallet }),

      login: (user, accessToken, refreshToken) => {
        Cookies.set('accessToken', accessToken, { expires: 7 });
        Cookies.set('refreshToken', refreshToken, { expires: 30 });
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('accessToken', accessToken);
            window.localStorage.setItem('refreshToken', refreshToken);
          }
        } catch {
          // ignore
        }
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('accessToken');
            window.localStorage.removeItem('refreshToken');
          }
        } catch {
          // ignore
        }
        set({
          user: null,
          wallet: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      updateWallet: (updates) =>
        set((state) => ({
          wallet: state.wallet ? { ...state.wallet, ...updates } : null,
        })),
    }),
    {
      name: 'varlixo-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setUser(state.user);
        }
      },
    }
  )
);

// UI store for global UI state
interface UIState {
  sidebarOpen: boolean;
  modalOpen: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  modalOpen: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (modalId) => set({ modalOpen: modalId }),
  closeModal: () => set({ modalOpen: null }),
}));

// Notification store
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) =>
    set((state) => {
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      };
      return {
        notifications: [newNotification, ...state.notifications].slice(0, 50),
        unreadCount: state.unreadCount + 1,
      };
    }),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

// Language store
import { Language, getTranslation, defaultLanguage, languages } from './i18n';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: defaultLanguage,
      
      setLanguage: (lang) => {
        set({ language: lang });
        // Update document direction for RTL languages
        const langConfig = languages.find(l => l.code === lang);
        if (langConfig) {
          document.documentElement.dir = langConfig.dir;
          document.documentElement.lang = lang;
        }
      },
      
      t: (key) => getTranslation(get().language, key),
    }),
    {
      name: 'varlixo-language',
    }
  )
);

