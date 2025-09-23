import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { config } from "@/config";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { Loader2 } from "lucide-react";
import ContactForm from "@/components/ContactForm";

interface Product {
  id: string;
  name: string;
  price: number;
  images?: string[];
  category_name?: string;
  description?: string;
}

const API_BASE_URL = config.API_URL;

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const services = [
    {
      title: "Networking",
      info: "Network installations like data points, CCTVS installations, cable management.",
    },
    {
      title: "IT support",
      info: "We provide office support.",
    },
    {
      title: "System Installations",
      info: "Installations of POS systems.",
    },
    {
      title: "Operating systems Installations",
      info: "Windows 11, Windows 10, Windows 7.",
    },
    {
      title: "Software installations",
      info: "Autocad, Adobe illustrator, Microsoft office",
    },
    {
      title: "Computer repair",
      info: "Motherboard repair, write BIOS",
    },
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/featured.php`);
        if (!response.ok) {
          throw new Error("Failed to fetch featured products.");
        }
        const data: Product[] = await response.json();
        setFeatured(data);
      } catch (error) {
        toast.error("Failed to load featured products.");
        console.error("Error fetching featured products: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    setAddedItems((prev) => [...prev, product.id]);
    //console.log(product)
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] flex items-center justify-center p-6 ">
        {/* SVG geometric background */}
        {/* <svg
          className="absolute inset-0 w-full h-full opacity-20 text-[#004d66]"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg> */}
       

        <div className="relative text-center text-black z-10">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-2xl md:text-4xl font-bold mb-4"
          >
            Empowering Your Business Through Smart IT
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-md md:text-xl max-w-2xl mx-auto"
          >
            Professional IT support, consulting, and network solutions tailored
            for you.
          </motion.p>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex space-x-4 justify-center mt-8"
          >
            <Link
              to="/products"
              className="bg-[#004d66] text-white px-4 py-3 rounded-md text-lg font-semibold hover:bg-white hover:text-[#004d66] transition-colors shadow-lg"
            >
              Shop Now
            </Link>
            <a
              href="/#contact"
              className="bg-white text-[#004d66] px-4 py-3 rounded-md text-lg font-semibold hover:bg-[#004d66] hover:text-white transition-colors shadow-lg border border-gray-300"
            >
              Contact us
            </a>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="py-16 px-6 md:px-20 max-w-full bg-gray-50"
      >
        <h2 className="text-3xl font-bold text-center text-[#004d66] mb-10">
          Our Services
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-md shadow-lg border border-gray-200 text-center"
            >
              <h3 className="text-lg font-semibold mb-2 text-[#004d66]">
                {service.title}
              </h3>
              <p className="text-sm text-gray-500 mt-2">{service.info}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured-products" className="py-16 px-6">
        <h2 className="text-3xl font-bold text-center text-[#004d66] mb-10">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col min-h-screen items-center justify-center">
              <Loader2 className="animate-spin text-[#004d66] mb-2" />
              <p>Loading</p>
            </div>
          ) : featured.length > 0 ? (
            featured.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
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
                  <p className="text-gray-500 mb-4">
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
                    className={`w-full cursor-pointer py-3 rounded-lg font-medium transition-colors ${
                      addedItems.includes(product.id)
                        ? "bg-green-600 text-white cursor-not-allowed"
                        : "bg-[#004d66] text-white hover:bg-teal-700"
                    }`}
                  >
                    {addedItems.includes(product.id) ? "Added " : "Add to Cart"}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-3 text-center py-10 text-gray-500">
              No featured products found.
            </div>
          )}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-block bg-[#004d66] text-white px-6 py-3 rounded-sm hover:bg-teal-700 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-16 px-6 flex flex-col items-center min-w-full bg-gray-50"
      >
        <h2 className="text-3xl font-bold text-center text-[#004d66] mb-10">
          Contact Us
        </h2>
        <ContactForm />
      </section>

      {/* Footer */}
      <footer className="bg-[#004d66] text-white text-center py-6">
        &copy; {new Date().getFullYear()} SmartLan. All rights reserved.
      </footer>
    </>
  );
}
