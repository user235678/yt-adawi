import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Product } from '~/components/boutique/ProductGrid';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; size: string; color: string } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity, size, color } = action.payload;
      const itemId = `${product.id}-${size}-${color}`;
      
      const existingItemIndex = state.items.findIndex(item => item.id === itemId);
      
      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Mettre à jour la quantité si l'article existe déjà
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Ajouter un nouvel article
        const newItem: CartItem = {
          id: itemId,
          product,
          quantity,
          selectedSize: size,
          selectedColor: color,
        };
        newItems = [...state.items, newItem];
      }

      const total = newItems.reduce((sum, item) => {
        const price = parseFloat(item.product.price.replace(/[^0-9.]/g, ''));
        return sum + (price * item.quantity);
      }, 0);

      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id);
      const total = newItems.reduce((sum, item) => {
        const price = parseFloat(item.product.price.replace(/[^0-9.]/g, ''));
        return sum + (price * item.quantity);
      }, 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { id } });
      }

      const newItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );

      const total = newItems.reduce((sum, item) => {
        const price = parseFloat(item.product.price.replace(/[^0-9.]/g, ''));
        return sum + (price * item.quantity);
      }, 0);

      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0,
      };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}