import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  cart: any[];
  addToCart: (product: any) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      
      // 1. name-ээр биш ID-гаар нь сагсанд байгаа эсэхийг шалгадаг болгов
      addToCart: (product) => set((state) => {
        const existing = state.cart.find((item) => item.id === product.id);
        if (existing) {
          return { 
            cart: state.cart.map((item) => 
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ) 
          };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }),

      // 2. ID-гаар устгах
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== id)
      })),

      // 3. ID-гаар тоо ширхэг өөрчлөх
      updateQuantity: (id, quantity) => set((state) => ({
        cart: state.cart.map((item) => 
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      })),

      clearCart: () => set({ cart: [] }),
    }),
    { name: 'my-shop-cart' }
  )
);