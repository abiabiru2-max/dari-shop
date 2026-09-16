"use client";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import Navbar from "../components/Navbar";
import AddToCartButton from "../components/AddToCartButton";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Хайлт болон Ангилалын State-үүд
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Бүгд");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // 1. Өгөгдлийн сангаас бараануудыг татах
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*");
    if (data && !error) {
      setProducts(data);
      setFilteredProducts(data);

      // Бараануудаас давхардахгүйгээр ангилалуудыг нь ялгаж авах
      const uniqueCategories = ["Бүгд", ...Array.from(new Set(data.map((p) => p.category).filter(Boolean)))];
      setCategories(uniqueCategories);
    }
    setLoading(false);
  };

  // 2. Хайлт болон Ангилалаар шүүх логик
  useEffect(() => {
    let result = products;

    // Ангилалаар шүүх
    if (selectedCategory !== "Бүгд") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Нэрээр хайх (жижиг том үсэг харгалзахгүй)
    if (searchQuery.trim() !== "") {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, products]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto w-full p-6 flex-1">
        {/* ТОЛГОЙ ХЭСЭГ & ХАЙЛТ */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Манай Бараанууд</h1>
            <p className="text-sm text-gray-500 mt-1">Шилдэг бүтээгдэхүүнүүдийг нэг дороос</p>
          </div>

          {/* ХАЙЛТЫН ИНПУТ */}
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Барааны нэрээр хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm shadow-sm"
            />
          </div>
        </div>

        {/* АНГИЛАЛ СҮМЖИХ ХЭСЭГ (CATEGORY TABS) */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* БАРАА БҮРТГЭЛИЙН ЖАГСААЛТ */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Бараануудыг уншиж байна...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg shadow-sm border text-gray-500">
            Хайлтад тохирох бараа олдсонгүй.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition relative"
                >
                  {/* Үлдэгдэл дууссан шошго */}
                  {isOutOfStock && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                      Дууссан
                    </div>
                  )}

                  <div>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {product.category || "Ангилалгүй"}
                      </span>
                      <h3 className="font-bold text-gray-800 text-base mt-2">{product.name}</h3>
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-blue-600 font-extrabold text-lg">
                          ₮ {product.price?.toLocaleString()}
                        </p>
                        <p className={`text-xs ${isOutOfStock ? "text-red-500 font-bold" : "text-gray-400"}`}>
                          Үлдэгдэл: {product.stock ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    {isOutOfStock ? (
                      <button
                        disabled
                        className="w-full mt-4 bg-gray-200 text-gray-500 py-2 rounded-md font-medium text-sm cursor-not-allowed"
                      >
                        Зарагдаж дууссан
                      </button>
                    ) : (
                      <AddToCartButton product={product} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}