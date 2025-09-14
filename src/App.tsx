import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Search } from "lucide-react"

function App() {
  const [search, setSearch] = useState("")

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">SmartLan Store</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Welcome to SmartLan</h2>
        <p className="text-lg">Find the best deals tailored for you</p>
        <Button className="mt-6 bg-white text-indigo-600 hover:bg-gray-100">
          Shop Now
        </Button>
      </section>

      {/* Product Grid */}
      <main className="flex-1 px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {["Product A", "Product B", "Product C"].map((item, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle>{item}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">This is a placeholder description.</p>
              <Button className="mt-4 w-full">Add to Cart</Button>
            </CardContent>
          </Card>
        ))}
      </main>

      {/* Footer */}
      <footer className="bg-white shadow px-6 py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} SmartLan. All rights reserved.
      </footer>
    </div>
  )
}

export default App
