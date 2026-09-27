import type { Profile } from "@/db/schema";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { toast } from "sonner";
import { create } from "zustand";

import { createClient } from "@/lib/supabase/client";

export interface AuthUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown>;
}

interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSignOutModalOpen: boolean;

  // Actions
  init: () => () => void;
  fetchUser: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  openSignOutModal: () => void;
  closeSignOutModal: () => void;
  signOut: (options?: { redirectTo?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  isSignOutModalOpen: false,

  init: () => {
    let isSubscribed = true;

    // Run initial fetch
    get().fetchUser();

    try {
      const supabase = createClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isSubscribed) return;

        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          if (session?.user) {
            set({
              user: {
                id: session.user.id,
                email: session.user.email,
                phone: session.user.phone,
                user_metadata: session.user.user_metadata,
              },
              isAuthenticated: true,
            });
            await get().fetchUser();
            // Sync wishlist store
            useWishlistStore.setState({ isAuthenticated: true });
            useWishlistStore
              .getState()
              .fetchWishlist()
              .catch(() => {});
          }
        } else if (event === "SIGNED_OUT") {
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
          });
          useWishlistStore.setState({ isAuthenticated: false });
        }
      });

      return () => {
        isSubscribed = false;
        subscription.unsubscribe();
      };
    } catch (err) {
      console.warn("[useAuthStore] Supabase client init warning:", err);
      return () => {};
    }
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true });

      // 1. Fetch server-validated profile
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        if (data?.profile) {
          const profile: Profile = data.profile;
          set({
            profile,
            user: {
              id: profile.id,
              email: profile.email,
              phone: profile.phone,
            },
            isAuthenticated: true,
            isLoading: false,
          });
          useWishlistStore.setState({ isAuthenticated: true });
          return;
        }
      }

      // 2. Fallback to client Supabase SDK
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          set({
            user: {
              id: user.id,
              email: user.email,
              phone: user.phone,
              user_metadata: user.user_metadata,
            },
            isAuthenticated: true,
            isLoading: false,
          });
          useWishlistStore.setState({ isAuthenticated: true });
          return;
        }
      } catch {
        // Guest user or no session
      }

      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (err) {
      console.warn("[useAuthStore] fetchUser error:", err);
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setProfile: (profile: Profile | null) => {
    set((state) => ({
      profile,
      user: profile
        ? {
            id: profile.id,
            email: profile.email ?? state.user?.email,
            phone: profile.phone ?? state.user?.phone,
          }
        : state.user,
    }));
  },

  openSignOutModal: () => set({ isSignOutModalOpen: true }),
  closeSignOutModal: () => set({ isSignOutModalOpen: false }),

  signOut: async (options) => {
    try {
      set({ isSignOutModalOpen: false });

      // 1. Server-side session teardown
      await fetch("/api/auth/signout", { method: "POST" }).catch(() => {});

      // 2. Client-side Supabase signOut
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (clientErr) {
        console.warn("[useAuthStore] Client signOut warning:", clientErr);
      }

      // 3. Clear auth state
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
      });

      // 4. Reset wishlist auth state and reload guest wishlist
      useWishlistStore.setState({ isAuthenticated: false });
      useWishlistStore
        .getState()
        .fetchWishlist()
        .catch(() => {});

      // 5. Keep guest cart clean or refetch guest cart
      useCartStore.setState({ isOpen: false, isFastCheckoutOpen: false });
      useCartStore
        .getState()
        .fetchCart()
        .catch(() => {});

      toast.success("Signed out successfully. Come back soon!");

      if (options?.redirectTo) {
        window.location.href = options.redirectTo;
      }
    } catch (err) {
      console.error("[useAuthStore] signOut error:", err);
      toast.error("Failed to sign out. Please try again.");
    }
  },
}));
