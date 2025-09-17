"use client";

import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/254722441772"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 p-4 rounded-full shadow-lg hover:scale-110 hover:bg-green-600 transition-colors z-50"
    >
      <FaWhatsapp className="text-white text-2xl" />
    </a>
  );
}
