"use client";
import { useCartStore } from "../../utils/cartStore";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../utils/supabase";

export default function CartPage() {
  const { cart } = useCartStore();
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [isOrdered, setIsOrdered] = useState(false);
  const [loading, setLoading] = useState(false);

  // Нийт төлөх дүнг бодох
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Захиалгыг Supabase руу хадгалах функц
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Сагс хоосон байна!");

    setLoading(true);
    const { error } = await supabase.from("orders").insert([
      {
        phone: phone,
        note: note,
        total_price: totalPrice,
        status: "Хүлээгдэж буй",
      },
    ]);

    if (error) {
      alert("Захиалга үүсгэхэд алдаа гарлаа: " + error.message);
    } else {
      setIsOrdered(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Миний Сагс</h1>

        {!isOrdered ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Бараануудын жагсаалт */}
            <div className="md:col-span-2 space-y-4">
              {cart.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                  Сагс хоосон байна. <Link href="/" className="text-blue-600 underline">Бараа үзэх</Link>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div>
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-blue-600 font-bold">₮ {item.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-gray-600 font-medium">
                      {item.quantity} ш
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 2. Төлбөр болон Хэрэглэгчийн мэдээлэл оруулах хэсэг */}
            <div className="bg-white p-6 rounded-lg shadow h-fit space-y-4">
              <h2 className="text-lg font-bold border-b pb-2">Захиалгын хураангуй</h2>
              
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Нийт дүн:</span>
                <span className="text-blue-600">₮ {totalPrice.toLocaleString()}</span>
              </div>

              <form onSubmit={handleCheckout} className="space-y-3 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Утасны дугаар <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9911xxxx"
                    className="w-full border rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Захиалгын утга / Фейсбүүк хаяг
                  </label>
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Захиалгын утга болон бусад санамж"
                    className="w-full border rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 h-20"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className={`w-full text-white font-bold py-3 rounded-md transition ${
                    loading || cart.length === 0
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Илгээж байна..." : "Төлбөр төлөх рүү шилжих"}
                </button>
              </form>
            </div>

          </div>
        ) : (
          /* 3. Дансны мэдээлэл (Төлбөрийн хэсэг) */
          <div className="bg-white p-8 rounded-lg shadow max-w-lg mx-auto text-center space-y-6">
            <div className="bg-green-100 text-green-700 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center font-bold text-xl">
              ✓
            </div>
            <h2 className="text-xl font-bold text-gray-800">Захиалга үүслээ!</h2>
            
            <div className="bg-gray-50 p-4 rounded-md text-left space-y-2 text-sm">
              <p className="font-bold text-gray-700 border-b pb-1">Төлбөр шилжүүлэх заавар:</p>
              <p>🏦 <strong>Банк:</strong> ХААН БАНК</p>
              <p>💳 <strong>Дансны дугаар:</strong> 5000xxxxxx (Админ)</p>
              <p>💰 <strong>Шилжүүлэх дүн:</strong> <span className="text-blue-600 font-bold">₮ {totalPrice.toLocaleString()}</span></p>
              <p className="text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                ✍️ Гүйлгээний утга: {phone}
              </p>
            </div>

            <p className="text-xs text-gray-500">
              Та гүйлгээний утга дээр <strong>{phone}</strong> дугаараа заавал бичиж шилжүүлнэ үү. Админ төлбөрийг шалгаад захиалгыг баталгаажуулах болно.
            </p>

            <Link href="/" className="inline-block bg-gray-900 text-white px-6 py-2 rounded-md text-sm">
              Нүүр хуудас руу буцах
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}