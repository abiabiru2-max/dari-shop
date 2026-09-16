"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import toast, { Toaster } from "react-hot-toast";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // Идэвхтэй байгаа цэс
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "settings">("orders");

  // Бараа нэмэх формын state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState(""); 
  const [imageUrl, setImageUrl] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(false);

  // Жагсаалтын state
  const [orders, setOrders] = useState<any[]>([]);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Нууц үг солих state
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 💡 ШИНЭЧЛЭГДСЭН: Датабэйсээс нууц үг шалгаж нэвтрэх (Зөвхөн 1 удаа шалгана)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // admin_settings хүснэгтээс нууц үгийг татаж шалгах
    const { data, error } = await supabase
      .from("admin_settings")
      .select("pin")
      .eq("id", 1)
      .single();

    if (data && data.pin === password) {
      setIsAuthenticated(true);
      fetchOrders();
      fetchCategories();
    } else {
      toast.error("Админы нууц үг буруу байна!");
    }
  };

  // 💡 ШИНЭ: Нууц үг солих функц
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      return toast.error("Нууц үг дор хаяж 4 оронтой байх ёстой!");
    }

    setIsChangingPassword(true);
    const { error } = await supabase
      .from("admin_settings")
      .update({ pin: newPassword })
      .eq("id", 1);

    if (error) {
      toast.error("Алдаа гарлаа: " + error.message);
    } else {
      toast.success("Админы нууц үг амжилттай солигдлоо!");
      setNewPassword("");
    }
    setIsChangingPassword(false);
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase.from("orders").select("*").order("id", { ascending: false });
    if (!error && data) setOrders(data);
    setLoadingOrders(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("products").select("category");
    if (!error && data) {
      const uniqueCategories = Array.from(new Set(data.map(item => item.category).filter(Boolean))) as string[];
      setExistingCategories(uniqueCategories);
    }
  };

  const updateOrderStatus = async (order: any) => {
    if (!order || !order.id) return toast.error("Захиалгын ID олдсонгүй!");
    const { error } = await supabase.from("orders").update({ status: "Баталгаажсан" }).eq("id", order.id);
    if (error) return toast.error("Алдаа гарлаа: " + error.message);

    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      const { error: rpcError } = await supabase.rpc("reduce_product_stock", { order_items: order.items });
      if (rpcError) toast.error("Төлбөр баталгаажсан ч үлдэгдэл хасагдсангүй.");
      else toast.success("Захиалга баталгаажиж, үлдэгдэл хасагдлаа!");
    } else {
      toast.success("Захиалга баталгаажлаа!");
    }
    fetchOrders();
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProduct(true);
    const { error } = await supabase.from("products").insert([{
        name: name.trim(), price: Number(price), stock: Number(stock), category: category.trim(), image_url: imageUrl.trim(),
    }]);

    if (error) {
      toast.error("Алдаа гарлаа: " + error.message);
    } else {
      toast.success("Бараа амжилттай нэмэгдлээ!");
      setName(""); setPrice(""); setStock(""); setCategory(""); setImageUrl("");
      fetchCategories(); 
    }
    setLoadingProduct(false);
  };

  // НЭВТРЭХ ЦОНХ (Хэрэглэгчийн session шаардахгүй!)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Toaster position="top-center" />
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-black text-gray-800">Удирдах самбар</h1>
            <p className="text-sm text-gray-500 mt-2">Зөвхөн админ нэвтрэх эрхтэй</p>
          </div>
          <div>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Админы нууц үг..."
              className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-blue-500 transition text-center tracking-widest text-lg font-bold"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
            Нэвтрэх
          </button>
        </form>
      </div>
    );
  }

  // АДМИН ПАНЕЛЬ
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster position="top-center" />
      <div className="max-w-5xl mx-auto">
        
        {/* Толгой хэсэг */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow gap-4">
          <h1 className="text-xl font-bold text-gray-800">Админ Управлени</h1>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setActiveTab("orders"); fetchOrders(); }} className={`px-4 py-2 rounded-md font-medium text-sm transition ${ activeTab === "orders" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200" }`}>
              🛒 Захиалгууд
            </button>
            <button onClick={() => { setActiveTab("products"); fetchCategories(); }} className={`px-4 py-2 rounded-md font-medium text-sm transition ${ activeTab === "products" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200" }`}>
              ➕ Бараа нэмэх
            </button>
            <button onClick={() => setActiveTab("settings")} className={`px-4 py-2 rounded-md font-medium text-sm transition ${ activeTab === "settings" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200" }`}>
              ⚙️ Тохиргоо
            </button>
            <button onClick={() => setIsAuthenticated(false)} className="px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 md:ml-4">
              Гарах
            </button>
          </div>
        </div>

        {/* ЦЭС 1: ЗАХИАЛГУУД */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-gray-700">Ирсэн захиалгын жагсаалт</h2>
              <button onClick={fetchOrders} className="text-xs text-blue-600 underline">Шинэчлэх</button>
            </div>
            {loadingOrders ? (
              <p className="p-6 text-center text-gray-500">Ачаалж байна...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
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
                      <tr><td colSpan={5} className="p-6 text-center text-gray-400">Одоогоор захиалга байхгүй байна.</td></tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="p-4 font-bold text-gray-800">{order.phone}</td>
                          <td className="p-4 text-gray-600">{order.note || "-"}</td>
                          <td className="p-4 font-bold text-blue-600">₮ {order.total_price?.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ order.status === "Баталгаажсан" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800" }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4">
                            {order.status !== "Баталгаажсан" && (
                              <button onClick={() => updateOrderStatus(order)} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 transition font-medium">
                                Баталгаажуулах
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ЦЭС 2: ШИНЭ БАРАА НЭМЭХ */}
        {activeTab === "products" && (
          <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Шинэ бараа оруулах</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Барааны нэр *</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ангилал (Category) *</label>
                <input type="text" required list="category-options" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Сонгох эсвэл бичих..." className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50/30" />
                <datalist id="category-options">
                  {existingCategories.map((cat, index) => <option key={index} value={cat} />)}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үнэ (₮) *</label>
                  <input type="number" min="0" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үлдэгдэл /Ширхэг/ *</label>
                  <input type="number" min="0" required value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Зургийн URL *</label>
                <input type="url" required value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <button type="submit" disabled={loadingProduct} className="w-full bg-blue-600 text-white py-2.5 rounded font-bold hover:bg-blue-700 transition">
                {loadingProduct ? "Хадгалж байна..." : "Бараа хадгалах"}
              </button>
            </form>
          </div>
        )}

        {/* 💡 ШИНЭ ЦЭС 3: ТОХИРГОО (Нууц үг солих) */}
        {activeTab === "settings" && (
          <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
              ⚙️ Админы тохиргоо
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Шинэ нууц үг зохиох</label>
                <input 
                  type="text" 
                  required 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Шинэ нууц үгээ энд бичнэ үү"
                  className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1">Одоогийн нууц үг автоматаар энэ нууц үгээр солигдох болно.</p>
              </div>
              <button 
                type="submit" 
                disabled={isChangingPassword}
                className="w-full bg-gray-900 text-white py-2.5 rounded font-bold hover:bg-gray-800 transition"
              >
                {isChangingPassword ? "Сольж байна..." : "Нууц үг шинэчлэх"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}