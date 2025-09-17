import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import WhatsAppButton from "@/components/WhatsAppbutton"
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage"; // You will build this later
import { Toaster } from "sonner";

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Toaster richColors position="top-right" />
          <Navbar />
          <main className="flex-1 pt-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
            </Routes>
          </main>
          <WhatsAppButton />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;