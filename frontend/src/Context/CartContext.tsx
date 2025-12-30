import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  symbol: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (symbol: string, quantity?: number) => void;
  removeFromCart: (symbol: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        return JSON.parse(stored) as CartItem[];
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (symbol: string, quantity: number = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.symbol === symbol);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { symbol, quantity }];
    });
  };

  const removeFromCart = (symbol: string) => {
    setCart((prev) => prev.filter((i) => i.symbol !== symbol));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
