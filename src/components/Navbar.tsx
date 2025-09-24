import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ShoppingCart, Trash2, Minus, Plus} from "lucide-react";
import { useCart } from "../context/CartContext";
import { Button } from "./ui/button";
import { CheckoutDialog } from "./CheckoutDialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { toast } from "sonner";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, addToCart, removeFromCart, decreaseQuantity } = useCart();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
  ];

  const handleCloseNavSheet = () => {
    setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 200);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#004d66] shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-white">
          Smart Lan
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex gap-6 text-white font-medium">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.href} className="hover:underline">
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          {/* Cart Drawer */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="relative cursor-pointer">
                <ShoppingCart className="h-6 w-6 text-white" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                    {cart.length}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[350px] sm:w-[400px] flex flex-col"
            >
              <SheetHeader>
                <SheetTitle className="text-lg font-bold">Your Cart</SheetTitle>
              </SheetHeader>

              <div className="mt-2 flex-1 overflow-y-auto space-y-4 px-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center mt-10 text-gray-500">
                    <div className="bg-gray-100 p-4 rounded-full shadow-sm">
                      <ShoppingCart className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="mt-3 text-sm font-medium">
                      Your cart is empty
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="relative bg-white border rounded-lg shadow-sm p-4"
                    >
                      <button
                        onClick={() => {
                          removeFromCart(item.id);
                          toast.success(`${item.name} removed from cart!`);
                        }}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      <div className="flex flex-col">
                        <h3 className="font-semibold text-[#004d66]">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Ksh {item.price.toLocaleString()}
                        </p>
                        <div className="flex items-center mt-3 gap-3">
                          <button
                            onClick={() =>
                              item.quantity > 1 && decreaseQuantity(item.id)
                            }
                            className="p-1 border rounded hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-2 font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart({ ...item, quantity: 1 })}
                            className="p-1 border rounded hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-2 text-sm font-bold text-gray-700">
                          Subtotal: Ksh{" "}
                          {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t pt-4 mt-4 px-4">
                  <div className="flex justify-between mb-4 font-semibold text-lg">
                    <span>Total:</span>
                    <span>Ksh {total.toLocaleString()}</span>
                  </div>
                  <CheckoutDialog />
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button className="md:hidden" variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-white" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[250px] p-4 bg-white border-black/10"
            >
              <div className="text-2xl font-bold text-[#004d66] mb-4">
                Smart Lan
              </div>
              <nav className="flex-1 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={handleCloseNavSheet}
                    className="flex font-medium items-center p-2 rounded-lg hover:bg-[#004d66]/10 text-black/80"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
