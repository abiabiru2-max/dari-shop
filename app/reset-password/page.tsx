"use client";
import { useState } from "react";
import { supabase } from "../../utils/supabase";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast"; // Toaster нэмж оруулж ирлээ!

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      return toast.error("Нууц үг дор хаяж 6 тэмдэгт байх ёстой!");
    }

    setLoading(true);
    // Supabase дээр шинэ нууц үгийг шинэчлэх
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      // Одоо алдаа гарвал дэлгэцэнд улаанаар ил харагдана
      toast.error("Алдаа гарлаа: " + error.message);
    } else {
      toast.success("Нууц үг амжилттай солигдлоо!");
      // 1.5 секунд хүлээгээд Профайл руу автоматаар үсрэнэ
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {/* МЭДЭГДЭЛ ХАРУУЛАГЧИЙГ ЭНД БАЙРЛУУЛЛАА */}
      <Toaster position="top-center" /> 
      
      <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full">
        <h1 className="text-xl font-bold mb-2 text-center text-gray-800">Шинэ нууц үг зохиох</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">Та шинээр ашиглах нууц үгээ оруулна уу.</p>
        
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <input 
            type="password" 
            placeholder="Шинэ нууц үг (дор хаяж 6 тэмдэгт)" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Хадгалж байна..." : "Хадгалах"}
          </button>
        </form>
      </div>
    </div>
  );
}