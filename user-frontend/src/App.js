import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import SuccessMessage from './components/SuccessMessage';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Gallery from './pages/Gallery';
import Testimonial from './pages/Testimonial';
import AssemblyVideos from './pages/AssemblyVideos';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <SuccessMessage />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/testimonial" element={<Testimonial />} />
            <Route path="/assembly-videos" element={<AssemblyVideos />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;

