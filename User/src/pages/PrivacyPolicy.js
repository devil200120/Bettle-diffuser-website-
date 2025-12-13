import React, { useState } from "react";
import { ChevronDown, Mail, Globe } from "lucide-react";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  const [expandedSection, setExpandedSection] = useState(null);

  const sections = [
    {
      id: 1,
      title: "1. Introduction",
      content:
        "Welcome to Beetle Diffuser ('we,' 'our,' or 'us'). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and purchase our macro lens diffuser products. Please read this policy carefully. If you do not agree with the terms, please do not access the Site.",
    },
    {
      id: 2,
      title: "2. Information We Collect",
      content:
        "We may collect personal information that you voluntarily provide, including:",
      items: [
        "Personal Data: Name, email address, shipping/billing address, phone number, and payment information when you make a purchase.",
        "Derivative Data: Information our servers automatically collect, such as your IP address, browser type, operating system, access times, and pages viewed.",
        "Financial Data: Payment details processed by third-party payment processors (e.g., PayPal, Stripe). We do not store full credit card numbers.",
        "Photos/Content: If you submit photos using our product for reviews or galleries.",
      ],
    },
    {
      id: 3,
      title: "3. Use of Your Information",
      content: "We use the information to:",
      items: [
        "Process and fulfill orders",
        "Communicate about orders, products, and promotions",
        "Improve our website and product offerings",
        "Comply with legal obligations",
        "Display user-submitted photos (with consent)",
      ],
    },
    {
      id: 4,
      title: "4. Sharing of Information",
      content: "We do not sell your data. We may share information with:",
      items: [
        "Service providers (shipping, payment processing)",
        "Legal authorities if required by law",
        "Third parties with your consent",
      ],
    },
    {
      id: 5,
      title: "5. Data Security",
      content:
        "We implement security measures to protect your information but cannot guarantee absolute security. Your personal information is stored securely on our servers and is accessible only to authorized personnel.",
    },
    {
      id: 6,
      title: "6. Your Rights",
      content:
        "Depending on your location, you may have rights to access, correct, or delete your personal data. Contact us at connect@beetlediffuser.com to exercise these rights. We will respond to your request within 30 days.",
    },
    {
      id: 7,
      title: "7. Changes to This Policy",
      content:
        "We may update this policy at any time. Changes will be posted on this page with an updated revision date. Your continued use of our Site following the posting of revised Privacy Policy means that you accept and agree to the changes.",
    },
    {
      id: 8,
      title: "8. Contact Us",
      content:
        "If you have questions about this Privacy Policy or our privacy practices, please contact us at:",
      items: [
        "Email: connect@beetlediffuser.com",
        "Website: www.beetlediffuser.com",
        "Address: Beetle Diffuser, Macro Photography Solutions",
      ],
    },
  ];

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-dark-card text-gray-900 pt-28">
      {/* Header */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center text-red-600">Privacy Policy</h1>
      <p className="text-gray-400 text-lg text-center">Last updated: December 3, 2025</p>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Table of Contents */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-semibold text-black mb-4">
            Quick Navigation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => toggleSection(section.id)}
                className="text-left text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors duration-200"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 bg-white hover:bg-gray-50 flex items-center justify-between transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-black text-left">
                  {section.title}
                </h3>
                <ChevronDown
                  size={20}
                  className={`text-red-600 flex-shrink-0 transition-transform duration-200 ${
                    expandedSection === section.id ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {/* Expanded Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expandedSection === section.id ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {section.content}
                  </p>
                  {section.items && (
                    <ul className="space-y-3">
                      {section.items.map((item, index) => (
                        <li key={index} className="flex gap-3 text-gray-700">
                          <span className="text-red-600 font-bold flex-shrink-0">
                            •
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-black rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Have Questions?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <Mail className="text-red-600 flex-shrink-0 w-6 h-6 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a
                  href="mailto:connect@beetlediffuser.com"
                  className="text-gray-300 hover:text-red-600 transition-colors duration-200"
                >
                  connect@beetlediffuser.com
                </a>
              </div>
            </div>
            <div className="flex gap-4">
              <Globe className="text-red-600 flex-shrink-0 w-6 h-6 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Website</h3>
                <a
                  href="https://www.beetlediffuser.com"
                  className="text-gray-300 hover:text-red-600 transition-colors duration-200"
                >
                  www.beetlediffuser.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
}
