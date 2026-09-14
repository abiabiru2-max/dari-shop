"use client";
import Link from "next/link";
import { useCartStore } from "../utils/cartStore";

export default function Navbar() {
  const cart = useCartStore((state) => state.cart);
  // Сагсан дахь нийт барааны тоо ширхэгийг бодох
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Миний Дэлгүүр
        </Link>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/cart" 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md transition font-medium flex items-center gap-2"
          >
            🛒 Сагс 
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {totalItems}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}