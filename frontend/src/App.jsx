
import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage.jsx"
import ProductPage from "./pages/ProductPage.jsx"
import Navbar from "./components/navbar.jsx"
import { Toaster } from "react-hot-toast"


function App() {
  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-300" data-theme="cupcake">
     <Navbar/>
     <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/product/:id" element={<ProductPage/>}/>
     </Routes>

     <Toaster/>
    </div>
  )
}

export default App
