import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { config } from "@/config";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  images?: string[];
  category_name?: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
}

const API_BASE_URL = config.API_URL;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState<string[]>([]);

  // Function to fetch products based on search and category
  const fetchProducts = async (keyword: string, categoryId: string | null) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/products/search.php`;
      const params = new URLSearchParams();
      if (keyword) {
        params.append("keyword", keyword);
      }
      if (categoryId) {
        params.append("category_id", categoryId);
      }
      url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch products.");
      }
      const data = await response.json();
      //console.log(data);
      setProducts(data.data || []);
    } catch (err) {
      console.error("Error fetching products: ", err);
      setError("Failed to load products. Please try again later.");
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories on initial load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories/list.php`);
        if (!response.ok) {
          throw new Error("Failed to fetch categories.");
        }
        const data: Category[] = await response.json();
        setCategories([{ id: "all", name: "All" }, ...data]);
      } catch (err) {
        console.error("Error fetching categories: ", err);
        toast.error("Failed to load categories.");
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when search query or selected category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(
        searchQuery,
        selectedCategory === "all" ? null : selectedCategory
      );
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    setAddedItems((prev) => [...prev, product.id]);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="pt-10 min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-[#004d66] mb-8 text-center">
          Our Products
        </h1>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              className="pl-10 h-8 w-full border border-gray-400"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm",
                  selectedCategory === category.id
                    ? "bg-[#004d66] text-white hover:bg-[#004d66]/90"
                    : "bg-white hover:bg-gray-100"
                )}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex flex-col min-h-screen items-center justify-center">
            <Loader2 className="animate-spin text-[#004d66] mb-2" />
            <p>Loading</p>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-20">{error}</p>
        ) : products.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
              >
                <div className="relative p-2 w-full h-48 overflow-hidden bg-white">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0] || "images/placeholder.jpg"} 
                      alt={product.name}
                      className="w-full h-full object-scale-down"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-500 mb-4 truncate">
                    {product.description ||
                      "A high-quality product from Smart Lan."}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-[#004d66]">
                      Ksh {product.price.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {product.category_name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addedItems.includes(product.id)}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      addedItems.includes(product.id)
                        ? "bg-green-600 text-white cursor-not-allowed"
                        : "bg-[#004d66] text-white hover:bg-teal-700"
                    }`}
                  >
                    {addedItems.includes(product.id)
                      ? "Added"
                      : "Add to Cart"}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-gray-500 py-20">
            No products found. Please try a different search or filter.
          </p>
        )}
      </div>
    </div>
  );
}
