import React, { useState, useEffect } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { products as staticProducts } from '../data/products';

const API_URL = 'http://localhost:5001/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from backend API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/products`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        
        // Transform backend data to match frontend structure
        const transformedProducts = data.map(product => ({
          id: product._id,
          name: product.name,
          subtitle: product.subtitle || '',
          description: product.description,
          icon: product.icon,
          price: product.price,
          internationalPrice: product.internationalPrice || { single: 0, double: 0 },
          rating: product.rating || 5,
          features: product.features || [],
          specifications: product.specifications || [],
          compatibility: product.compatibility || [],
          sizes: product.sizes || [],
          variant: product.variant || [],
          footer: product.footer || '',
          loader: product.loader || [],
          info: product.info || []
        }));

        setProducts(transformedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        // Fallback to static products if API fails
        setProducts(staticProducts);
        setError('Using offline data');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const scrollToProducts = () => {
    const productsSection = document.getElementById('productsSection');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">🏆 Award-Winning Design</div>
            <h1 className="hero-title">Innovation in Macro Photography</h1>
            <p className="hero-subtitle">
              Professional-grade diffusers designed for perfection. Completely customized
              for your equipment.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={scrollToProducts}>
                Shop Now
              </button>
              <button className="btn btn-secondary" onClick={scrollToProducts}>
                View Products
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="product-showcase">
              <div className="product-icon">
                <img src="/images/beetle_logo.png" className="banner" alt="Beetle Diffuser" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section" id="productsSection">
        <div className="section-header">
          <h2 className="section-title">Our Premium Collection</h2>
          <p className="section-subtitle">
            Professional diffusers &amp; accessories for demanding photographers
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : error && products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-400 text-lg">{error}</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
