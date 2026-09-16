"use client";
import { useCartStore } from "../../utils/cartStore";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import Navbar from "../../components/Navbar";

export default function CartPage() {
  const { cart, clearCart, updateQuantity, removeFromCart } = useCartStore();
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [isOrdered, setIsOrdered] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [mounted, setMounted] = useState(false);
  const [finalPrice, setFinalPrice] = useState(0); 

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    setMounted(true);
    setIsOrdered(false);
    
    const savedPhone = localStorage.getItem("userPhone");
    if (savedPhone) {
      setPhone(savedPhone);
    }
  }, []);

  if (!mounted) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Уншиж байна...</div>;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    // Сагсанд байгаа бараануудын id, нэр, үнэ, тоо ширхэгийг JSON болгох
    const orderItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    // Orders хүснэгт рүү хадгалах (Синтакс зассан)
    const { error } = await supabase.from("orders").insert([
      { 
        phone, 
        note, 
        total_price: totalPrice, 
        status: "Хүлээгдэж буй",
        user_id: session?.user?.id,
        items: orderItems
      },
    ]);

    if (error) {
      alert("Алдаа гарлаа: " + error.message);
    } else {
      localStorage.setItem("userPhone", phone);
      setFinalPrice(totalPrice);
      setIsOrdered(true);
      clearCart();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar /> 
      
      <div className="max-w-4xl mx-auto w-full p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Миний Сагс</h1>

        {!isOrdered ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* БАРААНУУДЫН ЖАГСААЛТ */}
            <div className="md:col-span-2 space-y-4">
              {cart.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                  Сагс хоосон байна. <Link href="/" className="text-blue-600 underline">Бараа үзэх</Link>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={item.id || index} className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div>
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-blue-600 font-bold">₮ {item.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <button onClick={() => updateQuantity(item.name, item.quantity - 1)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition">-</button>
                        <span className="px-4 font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.name, item.quantity + 1)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.name)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition" title="Устгах">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ТӨЛБӨРИЙН ФОРМ */}
            <div className="bg-white p-6 rounded-lg shadow h-fit space-y-4">
              <h2 className="text-lg font-bold border-b pb-2">Захиалгын хураангуй</h2>
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Нийт дүн:</span>
                <span className="text-blue-600">₮ {totalPrice.toLocaleString()}</span>
              </div>
              <form onSubmit={handleCheckout} className="space-y-3 pt-4 border-t">
                <input 
                  type="text" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="Утасны дугаар *" className="w-full border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea 
                  value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="Захиалгын утга / Хаяг" className="w-full border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
                <button type="submit" disabled={loading || cart.length === 0} className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition">
                  {loading ? "Илгээж байна..." : "Төлбөр төлөх"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* БАНКНЫ ЛОГОТОЙ ТӨЛБӨРИЙН ХЭСЭГ */
          <div className="bg-white p-8 rounded-lg shadow max-w-lg mx-auto text-center space-y-6">
            <div className="bg-green-100 text-green-700 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center font-bold text-xl">✓</div>
            <h2 className="text-xl font-bold text-gray-800">Захиалга үүслээ!</h2>
            
            <div className="bg-gray-50 p-6 rounded-xl border text-left space-y-4">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="w-10 h-10 rounded bg-green-600 text-white flex items-center justify-center font-bold text-sm shadow-inner">
                  ХБ
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">ХААН БАНК</p>
                  <p className="text-gray-500 text-xs font-medium">Дансаар шилжүүлэх</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <p className="flex justify-between items-center text-gray-600">
                  <span>Дансны дугаар:</span> <strong className="text-lg tracking-wider text-gray-900">5000 1234 5678</strong>
                </p>
                <p className="flex justify-between text-gray-600">
                  <span>Хүлээн авагч:</span> <strong className="text-gray-900">Админ Овог Нэр</strong>
                </p>
                <p className="flex justify-between text-gray-600">
                  <span>Шилжүүлэх дүн:</span> <strong className="text-blue-600 text-lg">₮ {finalPrice.toLocaleString()}</strong>
                </p>
              </div>

              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-200 mt-2">
                <span className="font-bold text-sm">✍️ Гүйлгээний утга дээр:</span>
                <p className="text-center font-bold text-xl mt-1 tracking-widest">{phone}</p>
              </div>
            </div>

            <Link href="/" className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 transition">
              Нүүр хуудас руу буцах
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}