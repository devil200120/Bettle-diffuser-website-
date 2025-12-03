import React, { useState, useEffect, useCallback } from 'react';
import { carouselSlides } from '../data/products';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const showSlide = useCallback((index) => {
    let newIndex = index;
    if (index >= carouselSlides.length) {
      newIndex = 0;
    } else if (index < 0) {
      newIndex = carouselSlides.length - 1;
    }
    setCurrentSlide(newIndex);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 6000);

    return () => clearInterval(interval);
  }, [currentSlide, showSlide]);

  return (
    <div className="hero-carousel">
      <div
        className="carousel-slides"
        style={{ transform: `translateX(-${currentSlide * 100}vw)` }}
      >
        {carouselSlides.map((slide, index) => (
          <div
            key={index}
            className="carousel-slide"
            style={{ backgroundImage: `url('${slide.image}')` }}
          >
            <div className="slide-content">
              <h2>{slide.title}</h2>
              <p>{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="carousel-dots">
        {carouselSlides.map((_, index) => (
          <div
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => showSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
