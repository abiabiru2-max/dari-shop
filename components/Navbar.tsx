"use client";
import Link from "next/link";
import { useCartStore } from "../utils/cartStore";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react"; // useState, useEffect нэмсэн

export default function Navbar() {
  const cart = useCartStore((state) => state.cart);
  const [mounted, setMounted] = useState(false); // Дэлгэц уншиж дууссан эсэх

  // Дэлгэц амжилттай уншиж дуусмагц true болгоно
  useEffect(() => {
    setMounted(true);
  }, []);

  // Хэрэв уншиж дуусаагүй бол түр 0 гэж харуулна, дууссан бол жинхэнэ тоог гаргана
  const totalItems = mounted ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <>
      <Toaster position="top-center" />
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Миний Дэлгүүр
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/profile" 
              className="text-gray-600 hover:text-blue-600 font-medium text-sm transition flex items-center gap-2"
            >
              👤 Профайл
            </Link>

            <Link 
              href="/cart" 
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md transition font-medium flex items-center gap-2"
            >
              🛒 Сагс 
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {totalItems}
              </span>
            </Link>

            {/* 💡 ШИНЭ: Админ руу орох нууцлаг товч (Энгийн хэрэглэгчдэд анзаарагдахгүй шахам) */}
  <Link 
    href="/admin" 
    className="text-gray-300 hover:text-gray-600 transition flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
    title="Удирдах самбар"
  >
    ⚙️ {/* Эсвэл 🔒, 👨‍💻 гэх мэт дүрс байж болно */}
  </Link>
          </div>

        </div>
      </header>
    </>
  );
}