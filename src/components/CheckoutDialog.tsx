import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { config } from "@/config";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/context/CartContext";
import { LoaderCircle } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Button } from "@/components/ui/button";

type CheckoutStatus = "initial" | "pending" | "final";
type PaymentOutcome = "success" | "failed" | null;
type PaymentMethod = "stk" | "paybill";

const API_BASE_URL = config.API_URL;
//const API_BASE_URL = "https://smartlan.co.ke/api";

export function CheckoutDialog() {
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState<boolean>(false);
  const [checkoutStatus, setCheckoutStatus] =
    useState<CheckoutStatus>("initial");
  const [paymentOutcome, setPaymentOutcome] = useState<PaymentOutcome>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stk");
  const [showPaybillDetails, setShowPaybillDetails] = useState<boolean>(false);
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const [stkPushPolling, setStkPushPolling] = useState<boolean>(false);
  const [paybillPolling, setPaybillPolling] = useState<boolean>(false);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleStkPush = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const customer = {
      customer_name: formData.get("customer_name"),
      customer_email: formData.get("customer_email"),
      customer_phone: formData.get("customer_phone"),
      shipping_address: formData.get("shipping_address"),
    };
    console.log(customer);

    const orderItems = cart.map((item) => ({
      product_id: item.id,
      name: item.name,
      price_at_purchase: item.price,
      quantity: item.quantity,
    }));

    try {
      // Step 1: Create a pending order on the backend
      const createOrderResponse = await axios.post(
       `${API_BASE_URL}/orders/create_order.php`,
        {
          ...customer,
          items: orderItems,
        }
      );

      const { order_ref: newOrderRef } = createOrderResponse.data;
      setOrderRef(newOrderRef);
      setCheckoutStatus("pending");

      // Step 2: Initiate STK Push with the generated order reference
      const stkPushResponse = await axios.post(
        `${API_BASE_URL}/mpesa/stkpush.php`,
        {
          customer_phone: customer.customer_phone,
          amount: total,
          order_ref: newOrderRef,
        }
      );

      if (stkPushResponse.data.responseCode === "0") {
        toast.success("STK Push sent! Please enter your M-Pesa PIN.");
        setStkPushPolling(true);
      } else {
        toast.error("Failed to initiate STK Push. Please try again.");
        setCheckoutStatus("final");
        setPaymentOutcome("failed");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("An error occurred during checkout. Please try again.");
      setCheckoutStatus("final");
      setPaymentOutcome("failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePaybillContinue = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const customer = {
      customer_name: formData.get("customer_name"),
      customer_email: formData.get("customer_email"),
      customer_phone: formData.get("customer_phone"),
      shipping_address: formData.get("shipping_address"),
    };
    //console.log(customer);

    const orderItems = cart.map((item) => ({
      product_id: item.id,
      name: item.name,
      price_at_purchase: item.price,
      quantity: item.quantity,
    }));

    try {
      const createOrderResponse = await axios.post(
        `${API_BASE_URL}/orders/create_order.php`,
        {
          ...customer,
          items: orderItems,
        }
      );

      const { order_ref: newOrderRef } = createOrderResponse.data;
      setOrderRef(newOrderRef);
      setShowPaybillDetails(true);
      setCheckoutStatus("pending"); // Change status to pending for polling
    setPaybillPolling(true); // Start polling for Paybill
      toast.info("Order created. Please proceed to pay with Paybill.");
    } catch (error) {
      console.error("Order creation failed:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((stkPushPolling || paybillPolling) && orderRef) {
      // Polling logic remains the same
      intervalRef.current = window.setInterval(async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/mpesa/check_payment_status.php?order_ref=${orderRef}`
          );
          if (response.data.payment_status === "paid") {
            clearInterval(intervalRef.current!);
            setStkPushPolling(false);
            setPaybillPolling(false);
            setPaymentOutcome("success");
            setShowConfetti(true);
            clearCart();
            setCheckoutStatus("final");
            toast.success("Payment confirmed! Your order is being processed.");
          } else if (response.data.payment_status === "failed") {
            // For failed STK push, a cancellation might occur in the callback
            clearInterval(intervalRef.current!);
            setStkPushPolling(false);
            setPaybillPolling(false);
            setPaymentOutcome("failed");
            setCheckoutStatus("final");
            toast.error("Payment failed. Please try again.");
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 3000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [stkPushPolling, paybillPolling, orderRef, clearCart]);

  const renderContent = () => {
    switch (checkoutStatus) {
      case "initial":
        return (
          <Tabs
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stk">Lipa na M-Pesa (STK Push)</TabsTrigger>
              <TabsTrigger value="paybill">Paybill</TabsTrigger>
            </TabsList>
            <TabsContent value="stk" className="p-4">
              <form onSubmit={handleStkPush}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="customer_name"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="customer_email"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number (254...)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="customer_phone"
                      pattern="2547\d{8}"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="shipping_address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Shipping Address
                    </label>
                    <textarea
                      id="shipping_address"
                      name="shipping_address"
                      rows={3}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    ></textarea>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#004d66] text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <LoaderCircle className="mx-auto h-5 w-5 animate-spin" />
                    ) : (
                      `Pay KES ${total.toLocaleString()}`
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="paybill" className="p-4">
              {showPaybillDetails ? (
                <div className="space-y-4">
                  <p>
                    To complete your payment, use the following M-Pesa Paybill
                    details:
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-800">
                      Pay via Paybill:
                    </p>
                    <p className="font-mono text-lg text-teal-600">522533</p>
                    <p className="mt-2 font-semibold text-gray-800">
                      Account Number:
                    </p>
                    <p className="font-mono text-lg text-teal-600">7577359</p>
                    <p className="mt-2 font-semibold text-gray-800">Amount:</p>
                    <p className="font-mono text-lg text-teal-600">
                      KES {total.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Please use the provided Account Number. We are waiting for
                    the payment confirmation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePaybillContinue}>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="customer_name"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="customer_email"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Phone Number (254...)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="customer_phone"
                        pattern="2547\d{8}"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="shipping_address"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Shipping Address
                      </label>
                      <textarea
                        id="shipping_address"
                        name="shipping_address"
                        rows={3}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      ></textarea>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#004d66] text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <LoaderCircle className="mx-auto h-5 w-5 animate-spin" />
                      ) : (
                        `Continue to Paybill`
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>
        );
      case "pending":
        return (
          <div className="p-4 text-center">
            <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-[#004d66]" />
            <p className="mt-4 text-lg font-semibold">
              Awaiting Payment Confirmation...
            </p>
            <p className="mt-2 text-sm text-gray-500">
              We are waiting for the response from Safaricom. This may take a
              moment.
            </p>
            {orderRef && (
              <p className="font-mono mt-2 text-xs text-gray-400">
                Order Ref: {orderRef}
              </p>
            )}
          </div>
        );
      case "final":
        return (
          <div className="p-4 text-center">
            {paymentOutcome === "success" ? (
              <div className="text-green-600">
                <h2 className="text-xl font-bold">🎉 Payment Successful!</h2>
                <p className="mt-2 text-sm">Thank you for your purchase.</p>
                <p className="font-mono mt-2">Order Ref: {orderRef}</p>
                {showConfetti && (
                  <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    onConfettiComplete={() => setShowConfetti(false)}
                  />
                )}
              </div>
            ) : (
              <div className="text-red-600">
                <h2 className="text-xl font-bold">❌ Payment Failed</h2>
                <p className="mt-2 text-sm">
                  There was an issue with your transaction. Please try again.
                </p>
                <p className="font-mono mt-2">Order Ref: {orderRef}</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
