import { useState,  } from "react";
import type {FormEvent, ChangeEvent} from "react";
import { config } from '@/config';
import { toast } from "sonner";

const API_BASE_URL = config.API_URL;

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/contact/contact.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setForm({ name: "", email: "", message: "" });
        toast.success("Message sent successfully!");
      } else {
        const errorData = await res.json();
        toast.error("Failed to send message: " + (errorData.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white max-w-2xl border border-gray-200 shadow-sm rounded-xl p-6 space-y-4 w-full">
      <input
        type="text"
        name="name"
        placeholder="Your Name"
        value={form.name}
        onChange={handleChange}
        className="w-full border p-3 rounded-md"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Your Email"
        value={form.email}
        onChange={handleChange}
        className="w-full border p-3 rounded-md"
        required
      />
      <textarea
        name="message"
        placeholder="Your Message"
        rows={4}
        value={form.message}
        onChange={handleChange}
        className="w-full border p-3 rounded-md"
        required
      ></textarea>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-lg transition ${
          loading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#004d66] text-white hover:bg-teal-700"
        }`}
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}