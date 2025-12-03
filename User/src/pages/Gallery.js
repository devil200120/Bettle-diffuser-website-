import React, { useState } from 'react';
import Footer from '../components/Footer';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const images = [
    {
      id: 1,
      url: "https://ik.imagekit.io/ghpc4i0u6/1-Hyllus-semicupreus-female.jpg",
      title: "Hyllus Semicupreus Female",
      category: "Spiders"
    },
    {
      id: 2,
      url: "https://ik.imagekit.io/ghpc4i0u6/7-Raorchestes-jayarami.jpg",
      title: "Raorchestes Jayarami",
      category: "Frogs"
    },
    {
      id: 3,
      url: "https://ik.imagekit.io/ghpc4i0u6/6-Assasin-bugs.jpg",
      title: "Assassin Bugs",
      category: "Insects"
    },
    {
      id: 4,
      url: "https://ik.imagekit.io/ghpc4i0u6/5-Robber-fly-with-kill.jpg",
      title: "Robber Fly with Kill",
      category: "Insects"
    },
    {
      id: 5,
      url: "https://ik.imagekit.io/ghpc4i0u6/Final.jpg",
      title: "Macro Shot",
      category: "Featured"
    },
    {
      id: 6,
      url: "https://ik.imagekit.io/ghpc4i0u6/2-Robber-fly-with-kill.jpg",
      title: "Robber Fly with Prey",
      category: "Insects"
    },
    {
      id: 7,
      url: "https://ik.imagekit.io/ghpc4i0u6/Untitled-1.jpg",
      title: "Macro Photography",
      category: "Featured"
    },
    {
      id: 8,
      url: "https://ik.imagekit.io/ghpc4i0u6/8-Raorchestes-luteolus.jpg",
      title: "Raorchestes Luteolus",
      category: "Frogs"
    },
    {
      id: 9,
      url: "https://ik.imagekit.io/ghpc4i0u6/Ant-mimic.jpg",
      title: "Ant Mimic Spider",
      category: "Spiders"
    },
    {
      id: 10,
      url: "https://ik.imagekit.io/ghpc4i0u6/Untitled-2.jpg",
      title: "Nature Close-up",
      category: "Featured"
    },
    {
      id: 11,
      url: "https://ik.imagekit.io/ghpc4i0u6/Final-contrast.jpg",
      title: "High Contrast Macro",
      category: "Featured"
    },
    {
      id: 12,
      url: "https://ik.imagekit.io/ghpc4i0u6/PB160315-copy.jpg",
      title: "Wildlife Macro",
      category: "Featured"
    },
    {
      id: 13,
      url: "https://ik.imagekit.io/ghpc4i0u6/P9152323-copy-3.jpg",
      title: "Detailed Macro Shot",
      category: "Featured"
    }
  ];

  const openLightbox = (image) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d]">
      {/* Hero Section */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#E8C547] mb-4">
            Photo Gallery
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Stunning macro photography captured using Beetle Diffuser. See the incredible detail and lighting quality achieved by our community of photographers.
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square bg-[#2a2a2a]"
                onClick={() => openLightbox(image)}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg">
                      {image.title}
                    </h3>
                    <span className="text-[#E8C547] text-sm">
                      {image.category}
                    </span>
                  </div>
                </div>
                {/* Zoom Icon */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-[#E8C547] rounded-full p-2">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 text-white hover:text-[#E8C547] transition-colors z-10"
            onClick={closeLightbox}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Container */}
          <div 
            className="relative max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="w-full h-full object-contain rounded-lg"
            />
            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <h3 className="text-white font-bold text-2xl">
                {selectedImage.title}
              </h3>
              <span className="text-[#E8C547]">
                {selectedImage.category}
              </span>
            </div>
          </div>

          {/* Navigation hint */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm">
            Click anywhere to close
          </p>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Gallery;
