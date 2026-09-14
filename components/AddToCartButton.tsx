"use client";
import { useCartStore } from "../utils/cartStore";

export default function AddToCartButton({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <button 
      onClick={() => {
        addToCart(product);
        alert(`"${product.name}" сагсанд нэмэгдлээ!`);
      }}
      className="w-full mt-4 bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition"
    >
      Сагсанд нэмэх
    </button>
  );
}