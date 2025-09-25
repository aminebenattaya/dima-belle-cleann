// src/hooks/useWishlist.ts
'use client';

import { create } from 'zustand';
import {
  getUserWishlist,
  updateUserWishlist,
} from '@/services/wishlistService';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type WishlistStore = {
  wishlist: string[];
  loading: boolean;
  isToggling: boolean;
  setWishlist: (wishlist: string[]) => void;
  toggleWishlistItem: (productId: string) => Promise<void>;
  initialize: (user: User | null) => void;
};

export const useWishlist = create<WishlistStore>((set, get) => ({
  wishlist: [],
  loading: true,
  isToggling: false,

  setWishlist: (wishlist) => set({ wishlist }),

  toggleWishlistItem: async (productId) => {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not logged in to update wishlist');
      return;
    }
    set({ isToggling: true });
    const currentWishlist = get().wishlist;
    const newWishlist = currentWishlist.includes(productId)
      ? currentWishlist.filter((id) => id !== productId)
      : [...currentWishlist, productId];

    try {
      await updateUserWishlist(user.uid, newWishlist);
      set({ wishlist: newWishlist });
    } catch (error) {
      console.error('Failed to toggle wishlist item:', error);
      // Optionally revert state on failure
      set({ wishlist: currentWishlist });
    } finally {
      set({ isToggling: false });
    }
  },

  initialize: async (user: User | null) => {
    if (user) {
      set({ loading: true });
      const userWishlist = await getUserWishlist(user.uid);
      set({ wishlist: userWishlist, loading: false });
    } else {
      set({ wishlist: [], loading: false });
    }
  },
}));

// Initialize the store and listen for auth changes
onAuthStateChanged(auth, (user) => {
  useWishlist.getState().initialize(user);
});
