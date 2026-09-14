import { supabase } from "../utils/supabase";
import AddToCartButton from "../components/AddToCartButton";
import Navbar from "../components/Navbar"; // 1. Navbar компонентийг импортлох

export const dynamic = "force-dynamic";

export default async function Home() {
  // Supabase-ээс бүх барааг татаж авах
  const { data: products, error } = await supabase
    .from("products")
    .select("*");

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 2. Хуучин <header>...</header> хэсгийг устгаад <Navbar /> компонентоор орлуулсан */}
      <Navbar />

      {/* Үндсэн контент */}
      <div className="max-w-7xl mx-auto p-4 mt-8">
        <h2 className="text-xl font-semibold mb-6">Шинэ бараанууд</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products && products.map((product) => (
            <div key={product.id || product.name} className="bg-white p-4 rounded-lg shadow border border-gray-100 hover:shadow-lg transition">
              
              <div className="h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-500 overflow-hidden">
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-medium text-gray-800">{product.name}</h3>
              <p className="text-blue-600 font-bold mt-2">₮ {product.price.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Үлдэгдэл: {product.stock} ш</p>
              
              {/* Сагсанд нэмэх товчлуур */}
              <AddToCartButton product={product} />
            </div>
          ))}

          {(!products || products.length === 0) && (
            <p className="text-gray-500 col-span-full text-center py-8">
              Одоогоор бараа нэмэгдээгүй байна. /admin руу орж нэмнэ үү
            </p>
          )}
        </div>
      </div>
    </main>
  );
}