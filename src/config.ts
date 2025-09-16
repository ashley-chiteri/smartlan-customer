// src/config.ts
const dev = {
  API_URL: "http://localhost/api",
};

const prod = {
  API_URL: "https://smartlan.co.ke/api",
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;