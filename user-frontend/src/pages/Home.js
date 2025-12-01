import React from 'react';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { products } from '../data/products';

const Home = () => {
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
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
