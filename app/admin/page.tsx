"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";

export default function AdminDashboard() {
  // Нэвтрэх хэсгийн state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // Идэвхтэй байгаа цэс ("products" эсвэл "orders")
  const [activeTab, setActiveTab] = useState<"products" | "orders">("orders");

  // Бараа нэмэх формын state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(false);

  // Захиалгын жагсаалтын state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Нэвтрэх нууц үг шалгах (Түр хугацаанд PIN: 1234 гэж тохируулж болно)
  const handleLogin = (e: any) => {
    e.preventDefault();
    if (password === "1234") {
      setIsAuthenticated(true);
      fetchOrders();
    } else {
      alert("Нууц үг буруу байна! (Туршилтын нууц үг: 1234)");
    }
  };

  // Захиалгуудыг татах
  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase.from("orders").select("*");
    if (!error && data) {
      setOrders(data);
    }
    setLoadingOrders(false);
  };

  // Захиалгын төлөв өөрчлөх
  const updateOrderStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      fetchOrders();
    } else {
      alert("Алдаа гарлаа: " + error.message);
    }
  };

  // Шинэ бараа хадгалах
  const handleSaveProduct = async (e: any) => {
    e.preventDefault();
    setLoadingProduct(true);
    const { error } = await supabase.from("products").insert([
      {
        name: name,
        price: Number(price),
        stock: Number(stock),
        image_url: imageUrl,
      },
    ]);

    if (error) {
      alert("Алдаа гарлаа: " + error.message);
    } else {
      alert("Бараа амжилттай нэмэгдлээ!");
      setName("");
      setPrice("");
      setStock("");
      setImageUrl("");
    }
    setLoadingProduct(false);
  };

  // 1. НЭВТРЭЭГҮЙ ҮЕД ХАРУУЛАХ ЦОНХ
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full space-y-4">
          <h1 className="text-xl font-bold text-center text-gray-800">Админ нэвтрэх</h1>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Нууц үг</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PIN код оруулна уу"
              className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Туршилтын нууц үг: 1234</p>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
            Нэвтрэх
          </button>
        </form>
      </div>
    );
  }

  // 2. НЭВТЭРСЭН ҮЕД ХАРУУЛАХ АДМИН СҮЛЖЭЭ (DASHBOARD)
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Толгой хэсэг ба Цэс солих товчлуурууд */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
          <h1 className="text-xl font-bold text-gray-800">Админ Управлени</h1>
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab("orders"); fetchOrders(); }}
              className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                activeTab === "orders" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🛒 Захиалгууд шалгах
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                activeTab === "products" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ➕ Шинэ бараа нэмэх
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 ml-4"
            >
              Гарах
            </button>
          </div>
        </div>

        {/* ЦЭС 1: ЗАХИАЛГУУДЫГ ХАРУУЛАХ ХЭСЭГ */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-gray-700">Ирсэн захиалгын жагсаалт</h2>
              <button onClick={fetchOrders} className="text-xs text-blue-600 underline">Шинэчлэх</button>
            </div>
            {loadingOrders ? (
              <p className="p-6 text-center text-gray-500">Ачаалж байна...</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-sm text-gray-600">
                    <th className="p-4">Утасны дугаар</th>
                    <th className="p-4">Тэмдэглэл / Хаяг</th>
                    <th className="p-4">Нийт дүн</th>
                    <th className="p-4">Төлөв</th>
                    <th className="p-4">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400">Одоогоор захиалга байхгүй байна.</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-800">{order.phone}</td>
                        <td className="p-4 text-gray-600">{order.note || "-"}</td>
                        <td className="p-4 font-bold text-blue-600">₮ {order.total_price?.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.status === "Баталгаажсан" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {order.status !== "Баталгаажсан" && (
                            <button
                              onClick={() => updateOrderStatus(order.id, "Баталгаажсан")}
                              className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 transition font-medium"
                            >
                              Төлбөр баталгаажуулах
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ЦЭС 2: ШИНЭ БАРАА НЭМЭХ ХЭСЭГ */}
        {activeTab === "products" && (
          <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Шинэ бараа оруулах</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Барааны нэр</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үнэ (₮)</label>
                  <input 
                    type="number" required value={price} onChange={(e) => setPrice(e.target.value)}
                    className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үлдэгдэл /Ширхэг/</label>
                  <input 
                    type="number" required value={stock} onChange={(e) => setStock(e.target.value)}
                    className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Зургийн URL</label>
                <input 
                  type="text" required value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button 
                type="submit" disabled={loadingProduct}
                className="w-full bg-blue-600 text-white py-2.5 rounded font-bold hover:bg-blue-700 transition"
              >
                {loadingProduct ? "Хадгалж байна..." : "Бараа хадгалах"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}