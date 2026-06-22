"use client";

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { UserProfile } from './types';

type AuthProfile = Pick<UserProfile, 'name' | 'bio' | 'timezone' | 'avatarUrl'>;

export interface AuthAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  provider: 'local' | 'google' | 'supabase';
  createdAt: string;
  profile: UserProfile;
}

interface AuthResult {
  success: boolean;
  error?: string;
  account?: AuthAccount;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  timezone?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthState {
  accounts: AuthAccount[];
  currentUserId: string | null;
  isAuthenticated: boolean;
  register: (input: RegisterInput) => AuthResult;
  login: (input: LoginInput) => AuthResult;
  loginWithGoogle: (payload: { id: string; email: string; name: string; timezone?: string; avatarUrl?: string | null }) => AuthResult;
  syncSessionUser: (payload: { id: string; email: string; name: string; timezone?: string; avatarUrl?: string | null; provider?: 'google' | 'supabase' }) => void;
  clearSessionUser: () => void;
  logout: () => void;
  updateCurrentProfile: (updates: AuthProfile) => void;
  getCurrentAccount: () => AuthAccount | null;
}

const STORAGE_KEY = 'life-os-auth';

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const hashPassword = (value: string) => {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(i);
  }

  return `pw_${(hash >>> 0).toString(36)}_${value.length}`;
};

const createProfile = (name: string, timezone = 'UTC'): UserProfile => ({
  id: `user_${Date.now()}`,
  name,
  totalXp: 0,
  level: 1,
  lifeScore: 0,
  timezone,
  scores: {
    travel: 0,
    finance: 0,
    health: 0,
    learning: 0,
    goals: 0,
    habits: 0,
    projects: 0,
  },
});

const buildAccount = (input: RegisterInput): AuthAccount => {
  const normalizedEmail = normalizeEmail(input.email);
  const name = input.name.trim();
  const timezone = input.timezone?.trim() || 'UTC';
  const profile = createProfile(name, timezone);

  return {
    id: profile.id,
    name,
    email: normalizedEmail,
    passwordHash: hashPassword(input.password),
    provider: 'local',
    createdAt: new Date().toISOString(),
    profile,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accounts: [],
      currentUserId: null,
      isAuthenticated: false,

      register: (input) => {
        const name = input.name.trim();
        const email = normalizeEmail(input.email);
        const password = input.password.trim();

        if (name.length < 2) {
          return { success: false, error: 'Informe um nome válido.' };
        }

        if (!email || !email.includes('@')) {
          return { success: false, error: 'Informe um e-mail válido.' };
        }

        if (password.length < 6) {
          return { success: false, error: 'A senha precisa ter pelo menos 6 caracteres.' };
        }

        const existing = get().accounts.find((account) => account.email === email);
        if (existing) {
          return { success: false, error: 'Este e-mail já está cadastrado.' };
        }

        const account = buildAccount({ ...input, name, email });
        set((state) => ({
          accounts: [...state.accounts, account],
          currentUserId: account.id,
          isAuthenticated: true,
        }));

        return { success: true, account };
      },

      login: ({ email, password }) => {
        const normalizedEmail = normalizeEmail(email);
        const account = get().accounts.find((item) => item.email === normalizedEmail);

        if (!account) {
          return { success: false, error: 'Conta não encontrada.' };
        }

        if (account.passwordHash !== hashPassword(password)) {
          return { success: false, error: 'Senha incorreta.' };
        }

        set({ currentUserId: account.id, isAuthenticated: true });
        return { success: true, account };
      },

      loginWithGoogle: ({ id, email, name, timezone = 'UTC', avatarUrl = null }) => {
        const normalizedEmail = normalizeEmail(email);
        const displayName = name.trim() || normalizedEmail.split('@')[0] || 'Google User';

        const existing = get().accounts.find((account) => account.email === normalizedEmail);
        const nextAccount: AuthAccount = existing ? {
          ...existing,
          id: existing.id || id,
          name: displayName,
          provider: 'google',
          profile: {
            ...existing.profile,
            id: existing.profile.id || id,
            name: displayName,
            timezone: existing.profile.timezone || timezone,
            avatarUrl: avatarUrl ?? existing.profile.avatarUrl,
          },
        } : {
          id,
          name: displayName,
          email: normalizedEmail,
          passwordHash: '',
          provider: 'google',
          createdAt: new Date().toISOString(),
          profile: {
            id,
            name: displayName,
            totalXp: 0,
            level: 1,
            lifeScore: 0,
            timezone,
            avatarUrl: avatarUrl ?? undefined,
            scores: {
              travel: 0,
              finance: 0,
              health: 0,
              learning: 0,
              goals: 0,
              habits: 0,
              projects: 0,
            },
          },
        };

        set((state) => ({
          accounts: existing
            ? state.accounts.map((account) => (account.email === normalizedEmail ? nextAccount : account))
            : [...state.accounts, nextAccount],
          currentUserId: nextAccount.id,
          isAuthenticated: true,
        }));

        return { success: true, account: nextAccount };
      },

      syncSessionUser: ({ id, email, name, timezone = 'UTC', avatarUrl = null, provider = 'supabase' }) => {
        const normalizedEmail = normalizeEmail(email);
        const displayName = name.trim() || normalizedEmail.split('@')[0] || 'User';
        const existing = get().accounts.find((account) => account.email === normalizedEmail);

        const nextAccount: AuthAccount = existing ? {
          ...existing,
          id: existing.id || id,
          name: displayName,
          provider,
          profile: {
            ...existing.profile,
            id: existing.profile.id || id,
            name: displayName,
            timezone: existing.profile.timezone || timezone,
            avatarUrl: avatarUrl ?? existing.profile.avatarUrl,
          },
        } : {
          id,
          name: displayName,
          email: normalizedEmail,
          passwordHash: '',
          provider,
          createdAt: new Date().toISOString(),
          profile: {
            id,
            name: displayName,
            totalXp: 0,
            level: 1,
            lifeScore: 0,
            timezone,
            avatarUrl: avatarUrl ?? undefined,
            scores: {
              travel: 0,
              finance: 0,
              health: 0,
              learning: 0,
              goals: 0,
              habits: 0,
              projects: 0,
            },
          },
        };

        set((state) => ({
          accounts: existing
            ? state.accounts.map((account) => (account.email === normalizedEmail ? nextAccount : account))
            : [...state.accounts, nextAccount],
          currentUserId: nextAccount.id,
          isAuthenticated: true,
        }));
      },

      clearSessionUser: () => {
        set({ currentUserId: null, isAuthenticated: false });
      },

      logout: () => {
        set({ currentUserId: null, isAuthenticated: false });
      },

      updateCurrentProfile: (updates) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return;

        set((state) => ({
          accounts: state.accounts.map((account) => {
            if (account.id !== currentUserId) return account;

            const name = updates.name?.trim() || account.name;
            const profile = {
              ...account.profile,
              ...updates,
              name,
            };

            return {
              ...account,
              name,
              profile,
            };
          }),
        }));
      },

      getCurrentAccount: () => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return null;

        return get().accounts.find((account) => account.id === currentUserId) ?? null;
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accounts: state.accounts,
        currentUserId: state.currentUserId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
