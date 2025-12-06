import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AssemblyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_URL}/assembly-videos`);
      const data = await response.json();
      setVideos(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8C547]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-500 rounded-xl p-6 text-center">
              <p className="text-red-300 text-lg">{error}</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block bg-[#2a2a2a] rounded-xl px-8 py-6">
                <p className="text-gray-400 text-lg">
                  📹 No assembly videos available at the moment.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Check back soon for new videos!
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {videos.map((video) => (
                  <div 
                    key={video._id} 
                    className="bg-[#2a2a2a] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02]"
                  >
                    {/* Video Player */}
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <video
                        controls
                        className="absolute top-0 left-0 w-full h-full"
                        src={`${API_URL}${video.videoPath}`}
                        style={{ objectFit: 'cover' }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    
                    {/* Video Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {video.title}
                      </h3>
                      <p className="text-gray-400 mb-4">
                        {video.description}
                      </p>
                      {video.duration && (
                        <p className="text-sm text-gray-500">
                          Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')} minutes
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AssemblyVideos;
