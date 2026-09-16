"use client";
import { useCartStore } from "../utils/cartStore";
import toast from "react-hot-toast";
import { supabase } from "../utils/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddToCartButton({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    // Хэрэглэгч нэвтэрсэн эсэхийг шалгах
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      toast.error("Та эхлээд нэвтэрч орно уу!");
      router.push("/profile"); // Нэвтрэх хуудас руу шиднэ
    } else {
      addToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url,
      });

      toast.success(`"${product.name}" сагсанд нэмэгдлээ!`);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={loading}
      className="w-full mt-4 bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition"
    >
      {loading ? "Шалгаж байна..." : "Сагсанд нэмэх"}
    </button>
  );
}