import React from 'react';
import Footer from '../components/Footer';

const AssemblyVideos = () => {
  const videos = [
    {
      id: 1,
      title: "Beetle Diffuser Assembly Guide",
      description: "Learn how to assemble your Beetle Diffuser step by step.",
      facebookUrl: "https://www.facebook.com/100069467586021/videos/778067515250125/",
      embedUrl: "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F100069467586021%2Fvideos%2F778067515250125%2F&show_text=false&width=560"
    },
    {
      id: 2,
      title: "Beetle Diffuser Setup Tutorial",
      description: "Complete guide on setting up your Beetle Diffuser for macro photography.",
      facebookUrl: "https://www.facebook.com/100069467586021/videos/886653000446033/",
      embedUrl: "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F100069467586021%2Fvideos%2F886653000446033%2F&show_text=false&width=560"
    },
    {
      id: 3,
      title: "Beetle Diffuser Tips & Tricks",
      description: "Pro tips for getting the best results with your Beetle Diffuser.",
      facebookUrl: "https://www.facebook.com/100069467586021/videos/1334880557946788/",
      embedUrl: "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F100069467586021%2Fvideos%2F1334880557946788%2F&show_text=false&width=560"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d]">
      {/* Hero Section */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#E8C547] mb-4">
            Assembly Videos
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Watch our step-by-step video guides to learn how to assemble and use your Beetle Diffuser for the best macro photography results.
          </p>
        </div>
      </div>

      {/* Videos Section */}
      <div className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {videos.map((video) => (
              <div 
                key={video.id} 
                className="bg-[#2a2a2a] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02]"
              >
                {/* Video Embed */}
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={video.embedUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    title={video.title}
                  ></iframe>
                </div>
                
                {/* Video Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {video.description}
                  </p>
                  <a 
                    href={video.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#E8C547] hover:text-[#d4b43f] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Watch on Facebook
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* More Videos Coming Soon */}
          <div className="mt-12 text-center">
            <div className="inline-block bg-[#2a2a2a] rounded-xl px-8 py-6">
              <p className="text-gray-400 text-lg">
                🎬 More assembly videos coming soon!
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Subscribe to our social media for updates.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AssemblyVideos;
