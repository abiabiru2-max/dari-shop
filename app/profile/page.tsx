"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserOrders(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserOrders(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Нэвтэрсэн хэрэглэгчийн захиалгыг user_id-гаар хайх
  const fetchUserOrders = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    if (isLoginMode) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Нэвтрэхэд алдаа гарлаа: " + error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert("Бүртгүүлэхэд алдаа гарлаа: " + error.message);
      else alert("Амжилттай бүртгүүллээ! Одоо нэвтэрч орно уу.");
    }
    setAuthLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) return alert("И-мэйл хаягаа эхлээд бичнэ үү!");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) alert("Алдаа гарлаа: " + error.message);
    else alert("Таны и-мэйл рүү нууц үг сэргээх линк амжилттай илгээгдлээ.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOrders([]);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "1234") router.push("/admin");
    else alert("Нууц үг буруу байна!");
  };

  // НЭВТРЭЭГҮЙ ҮЕД
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
              {isLoginMode ? "Нэвтрэх" : "Шинээр бүртгүүлэх"}
            </h1>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">И-мэйл хаяг</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Нууц үг</label>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button type="submit" disabled={authLoading} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-md hover:bg-blue-700 transition">
                {authLoading ? "Түр хүлээнэ үү..." : (isLoginMode ? "Нэвтрэх" : "Бүртгүүлэх")}
              </button>
            </form>

            <div className="mt-6 text-center text-sm space-y-3">
              <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-blue-600 hover:underline font-medium">
                {isLoginMode ? "Бүртгэлгүй юу? Шинээр бүртгүүлэх" : "Аль хэдийн бүртгэлтэй юу? Нэвтрэх"}
              </button>
              {isLoginMode && (
                <div className="pt-2 border-t">
                  <button onClick={handleResetPassword} className="text-gray-500 hover:text-gray-800 transition">
                    Нууц үгээ мартсан уу?
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // НЭВТЭРСЭН ҮЕД
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="max-w-3xl mx-auto p-6 mt-8 flex-1 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Миний Профайл</h1>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium mb-1">{session.user.email}</p>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:underline font-medium">
              Системээс гарах
            </button>
          </div>
        </div>
        
        {/* ЗАХИАЛГЫН ТҮҮХ ХЭСЭГ */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="font-semibold text-gray-700 mb-4 border-b pb-3">Миний Захиалгууд</h2>

          {loading ? (
            <p className="text-center text-gray-500 py-6">Захиалгын түүхийг уншиж байна...</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-500 py-6 bg-gray-50 rounded">Одоогоор таны хийсэн захиалга байхгүй байна.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-50 p-4 rounded-md border flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">₮ {order.total_price?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Тэмдэглэл: {order.note || "Байхгүй"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Утас: {order.phone}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    order.status === "Баталгаажсан" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* АДМИН НЭВТРЭХ */}
      <div className="py-8 text-center mt-auto">
        {!showAdminLogin ? (
          <button onClick={() => setShowAdminLogin(true)} className="text-xs text-gray-300 hover:text-gray-500 transition px-4 py-2">
            Админ нэвтрэх
          </button>
        ) : (
          <form onSubmit={handleAdminLogin} className="max-w-xs mx-auto flex gap-2">
            <input type="password" placeholder="PIN код" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="flex-1 border rounded p-1.5 text-sm text-center outline-none" autoFocus />
            <button type="submit" className="bg-gray-800 text-white px-4 rounded text-sm hover:bg-gray-900">Орох</button>
            <button type="button" onClick={() => setShowAdminLogin(false)} className="text-gray-400 text-xs px-2">✕</button>
          </form>
        )}
      </div>
    </div>
  );
}