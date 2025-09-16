import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { config } from '@/config';
//import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";

type CheckoutStatus = 'initial' | 'pending' | 'final';
type PaymentOutcome = 'success' | 'failed' | null;

const API_BASE_URL = config.API_URL;

export function CheckoutDialog() {
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState<boolean>(false);
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>('initial');
  const [paymentOutcome, setPaymentOutcome] = useState<PaymentOutcome>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleCheckout = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const customer = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
    };

    try {
      const payload = {
        ...customer,
        total_amount: total,
        items: cart,
      };

      // This endpoint needs to be created on your PHP backend
      const response = await axios.post(`${API_BASE_URL}/checkout.php`, payload);
      const { order_ref, message } = response.data;

      if (response.status === 200 && order_ref) {
        setOrderRef(order_ref);
        setCheckoutStatus('pending');
        toast.success(message);
      } else {
        throw new Error(message || "Checkout failed. Please try again.");
      }
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.error : (err as Error).message;
      toast.error(`Checkout failed: ${errorMsg}`);
      setLoading(false);
      setCheckoutStatus('initial');
      setPaymentOutcome('failed');
    }
  };

  const renderContent = () => {
    switch (checkoutStatus) {
      case 'initial':
        return (
          <form onSubmit={handleCheckout} className="space-y-4">
            <input
              name="name"
              placeholder="Your Name"
              required
              className="w-full border rounded p-2"
            />
            <input
              name="email"
              placeholder="Your Email"
              type="email"
              required
              className="w-full border rounded p-2"
            />
            <input
              name="phone"
              placeholder="Phone (2547...)"
              type="tel"
              required
              className="w-full border rounded p-2"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004d66] text-white py-2 rounded-lg"
            >
              {loading ? "Processing..." : `Pay Ksh ${total.toLocaleString()} with M-Pesa`}
            </button>
          </form>
        );
      case 'pending':
        return (
          <div className="p-4 text-center">
            <h2 className="text-xl font-bold text-gray-600">Waiting for Payment...</h2>
            <p className="mt-2 text-sm text-gray-500">Please complete the M-Pesa transaction on your phone.</p>
            <p className="font-mono mt-2">Order Ref: {orderRef}</p>
          </div>
        );
      case 'final':
        return (
          <div className="p-4 text-center">
            {paymentOutcome === 'success' ? (
              <div className="text-green-600">
                <h2 className="text-xl font-bold">🎉 Payment Successful!</h2>
                <p className="mt-2 text-sm">Thank you for your purchase.</p>
                <p className="font-mono mt-2">Order Ref: {orderRef}</p>
              </div>
            ) : (
              <div className="text-red-600">
                <h2 className="text-xl font-bold">❌ Payment Failed</h2>
                <p className="mt-2 text-sm">There was an issue with your transaction. Please try again.</p>
                <p className="font-mono mt-2">Order Ref: {orderRef}</p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <button
          disabled={cart.length === 0}
          className="mb-2 w-full bg-[#004d66] text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
        >
          Checkout
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}