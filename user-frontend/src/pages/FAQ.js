import React, { useState } from 'react';
import Footer from '../components/Footer';
import { faqData } from '../data/products';

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (sectionIndex, itemIndex) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isOpen = (sectionIndex, itemIndex) => {
    const key = `${sectionIndex}-${itemIndex}`;
    return openItems[key] || false;
  };

  return (
    <div>
      <div className="faq-container">
        {faqData.map((section, sectionIndex) => (
          <div key={sectionIndex} className="faq-section">
            <div className="faq-section-header">{section.title}</div>
            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className={`faq-item ${isOpen(sectionIndex, itemIndex) ? 'open' : ''}`}
              >
                <div
                  className="faq-question"
                  onClick={() => toggleItem(sectionIndex, itemIndex)}
                >
                  {item.question}
                </div>
                <div className="faq-answer">
                  {item.answer}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
