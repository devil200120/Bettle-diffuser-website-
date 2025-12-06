import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch(`${API_URL}/faqs`);
      const data = await response.json();
      
      // Group FAQs by category
      const grouped = (data.data || []).reduce((acc, faq) => {
        const category = faq.category || 'General';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(faq);
        return acc;
      }, {});
      
      setFaqs(grouped);
      setError(null);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (category, faqId) => {
    const key = `${category}-${faqId}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isOpen = (category, faqId) => {
    const key = `${category}-${faqId}`;
    return openItems[key] || false;
  };

  if (loading) {
    return (
      <div>
        <div className="faq-container">
          <h1 className="faq-title">Frequently Asked Questions</h1>
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8C547]"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="faq-container">
          <h1 className="faq-title">Frequently Asked Questions</h1>
          <div className="text-center py-16 text-red-500">
            {error}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <div className="faq-container">
        <h1 className="faq-title">Frequently Asked Questions</h1>
        {Object.keys(faqs).length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No FAQs available at the moment.
          </div>
        ) : (
          Object.keys(faqs).sort().map((category) => (
            <div key={category} className="faq-section">
              <div className="faq-section-header">{category}</div>
              {faqs[category].map((faq) => (
                <div
                  key={faq._id}
                  className={`faq-item ${isOpen(category, faq._id) ? 'open' : ''}`}
                >
                  <div
                    className="faq-question"
                    onClick={() => toggleItem(category, faq._id)}
                  >
                    {faq.question}
                  </div>
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
