
// src/hooks/useCart.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string, color: string) => void;
  updateItemQuantity: (productId: string, color: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem, quantity = 1) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) => item.productId === newItem.productId && item.color === newItem.color
        );

        let updatedItems;
        if (existingItemIndex > -1) {
          updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += quantity;
        } else {
          updatedItems = [...currentItems, { ...newItem, quantity }];
        }
        
        set({ items: updatedItems });
      },

      removeItem: (productId, color) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.color === color)
          ),
        }));
      },

      updateItemQuantity: (productId, color, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId, color);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.color === color
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'dima-belle-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
