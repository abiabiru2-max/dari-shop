import { create } from 'zustand';

interface CartState {
  cart: any[];
  addToCart: (product: any) => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: [], // Эхлээд сагс хоосон байна
  
  // Бараа нэмэх функц
  addToCart: (product) => set((state) => {
    // Энэ бараа сагсанд өмнө нь орсон эсэхийг шалгах
    const existing = state.cart.find((item) => item.name === product.name);
    
    if (existing) {
      // Хэрэв байвал тоо ширхэгийг нь 1-ээр нэмэгдүүлэх
      return {
        cart: state.cart.map((item) =>
          item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    // Хэрэв байхгүй бол шинээр нэмэх (quantity: 1 гэж өгөөд)
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),
}));