import React from 'react';
import Footer from '../components/Footer';

const AssemblyVideos = () => {
  const videos = [
    {
      id: 1,
      title: "Beetle Diffuser Pro v2 Assembly Video",
      description: "Learn how to assemble your Beetle Diffuser Pro version 2 step by step. ",
      youtubeId: "9GHRxSJkE1M",
      youtubeUrl: "https://youtu.be/9GHRxSJkE1M"
    },
    {
      id: 2,
      title: "Beetle Diffuser Lite v2 Assembly Video",
      description: "Learn how to assemble your Beetle Diffuser Lite version 2 step by step.",
      youtubeId: "qUtLdRH_C5Y",
      youtubeUrl: "https://youtu.be/qUtLdRH_C5Y"
    },
    {
      id: 3,
      title: "Twin Beetle Diffuser Assembly Video",
      description: "Complete guide on setting up your Twin Beetle Diffusers for macro photography.",
      youtubeId: "8RZyiuWr668",
      youtubeUrl: "https://youtu.be/8RZyiuWr668"
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
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ border: 'none' }}
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#E8C547] hover:text-[#d4b43f] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Watch on YouTube
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
                Subscribe to our YouTube channel for updates.
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
