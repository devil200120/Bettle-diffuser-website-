import React, { useState } from "react";
import { ChevronDown, AlertCircle, FileText } from "lucide-react";
import Footer from "../components/Footer";

export default function TermsAndConditions() {
  const [expandedSection, setExpandedSection] = useState(null);

  const sections = [
    {
      id: 1,
      title: "1. Agreement to Terms",
      content:
        "By accessing or purchasing from Beetle Diffuser ('Site'), you agree to these Terms & Conditions. If you disagree, do not use the Site. Your continued use of our website and products indicates your acceptance of all terms, conditions, and policies outlined herein.",
    },
    {
      id: 2,
      title: "2. Intellectual Property",
      content:
        "All content, including product designs, images, logos, text, and graphics, is owned by Beetle Diffuser and protected by copyright laws. This includes but is not limited to:",
      items: [
        "Product photography and macro lens diffuser designs",
        "Brand logos and trademarks",
        "Website layout and structure",
        "Marketing materials and descriptions",
        "Unauthorized use, reproduction, or distribution is strictly prohibited without written permission.",
      ],
    },
    {
      id: 3,
      title: "3. Product Information",
      content:
        "We strive for accuracy in all product descriptions, specifications, and pricing. However, we reserve the right to:",
      items: [
        "Correct errors in product information or pricing",
        "Update product specifications and availability",
        "Modify product images and descriptions",
        "Macro lens diffusers are photographic accessories. Compatibility with your camera equipment is the user's responsibility. We recommend checking compatibility before purchase.",
      ],
    },
    {
      id: 4,
      title: "4. Purchases and Payment",
      content:
        "When making a purchase on our Site, you agree to the following:",
      items: [
        "Orders are subject to product availability and acceptance of your order",
        "You agree to provide accurate, complete, and current payment information",
        "We use third-party payment processors (Stripe, PayPal, etc.) to process transactions securely",
        "Prices are displayed in USD and subject to change without notice",
        "You are responsible for any applicable taxes on your purchase",
        "Payment must be received and verified before order fulfillment",
      ],
    },
    {
      id: 5,
      title: "5. Shipping and Returns",
      content: "Our shipping and return policies are as follows:",
      items: [
        "Shipping times are estimates and not guaranteed",
        "Orders are processed within 2-3 business days",
        "We ship via major carriers with tracking information provided",
        "International shipping may incur additional fees and customs duties",
        "See our Return Policy for details on returns, exchanges, and refunds",
        "Products must be in original, unused condition with all packaging and materials",
        "Refunds are processed within 7-10 business days after return approval",
      ],
    },
    {
      id: 6,
      title: "6. User-Generated Content",
      content:
        "By submitting photos, reviews, testimonials, or other content to Beetle Diffuser, you grant us a non-exclusive, royalty-free license to:",
      items: [
        "Use your content for promotional and marketing purposes",
        "Display your photos on our website and social media platforms",
        "Modify, adapt, or create derivative works from your submissions",
        "You retain ownership of your content and can request removal at any time",
        "By submitting content, you affirm that you own the content and have all necessary rights",
      ],
    },
    {
      id: 7,
      title: "7. Disclaimer of Warranties",
      content:
        "The Site and products are provided 'AS IS' without warranty of any kind. We do not guarantee:",
      items: [
        "Uninterrupted or error-free service or website access",
        "That the Site will be free from viruses or harmful code",
        "That defects will be corrected or that the service will meet your expectations",
        "Product performance in specific photography conditions or with all camera models",
        "Implied warranties of merchantability and fitness for a particular purpose are disclaimed",
      ],
    },
    {
      id: 8,
      title: "8. Limitation of Liability",
      content:
        "To the fullest extent permitted by law, Beetle Diffuser shall not be liable for:",
      items: [
        "Indirect, incidental, special, or consequential damages",
        "Loss of profits, revenue, or business opportunities",
        "Damage to photographs or loss of images",
        "Product failure or damage arising from product use or misuse",
        "Any damages arising from unauthorized access to our Site",
        "Our total liability shall not exceed the amount paid for the product in question",
      ],
    },
    {
      id: 9,
      title: "9. Indemnification",
      content:
        "You agree to indemnify, defend, and hold harmless Beetle Diffuser and its officers, directors, employees, and agents from any:",
      items: [
        "Claims, damages, or costs arising from your use of the Site",
        "Violation of these Terms & Conditions",
        "Violation of any applicable law or third-party rights",
        "Your infringement of intellectual property or other rights",
        "Your use of products for purposes other than intended use",
        "Third-party claims related to your actions or content",
      ],
    },
    {
      id: 10,
      title: "10. Governing Law",
      content:
        "These Terms & Conditions are governed by and construed in accordance with the laws of the jurisdiction in which Beetle Diffuser operates, without regard to its conflict of law provisions. You agree to submit to the exclusive jurisdiction and venue of the courts located in this jurisdiction for any legal proceedings arising from these Terms.",
    },
    {
      id: 11,
      title: "11. Changes to Terms",
      content:
        "We reserve the right to modify these Terms & Conditions at any time. Changes will be effective immediately upon posting to the Site. Your continued use of the Site after any modifications constitutes your acceptance of the new Terms & Conditions. We will notify you of significant changes via email or through a prominent notice on our Site.",
    },
    {
      id: 12,
      title: "12. Contact Information",
      content:
        "If you have questions or concerns about these Terms & Conditions, please contact us:",
      items: [
        "Email: connect@beetlediffuser.com",
        "Website: www.beetlediffuser.com",
        "Response time: We will respond to inquiries within 5 business days",
      ],
    },
  ];

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="min-h-screen ">
      <h1 className="text-4xl md:text-5xl text-red-400 font-bold mt-28 text-center">Terms & Conditions</h1>
      <p className="text-gray-400 text-lg text-center">Last updated: December 3, 2025</p>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Alert Banner */}
        <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-12 rounded-r-lg">
          <div className="flex gap-4">
            <AlertCircle className="text-red-600 flex-shrink-0 w-6 h-6 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">
                Important
              </h3>
              <p className="text-red-700 text-sm">
                Please read these Terms & Conditions carefully before making any
                purchases or using our Site. By proceeding, you acknowledge that
                you have read, understood, and agree to be bound by all
                provisions.
              </p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 mb-12 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-red-600 w-5 h-5" />
            <h2 className="text-xl font-semibold text-black">
              Quick Navigation
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => toggleSection(section.id)}
                className="text-left text-red-600 hover:text-red-700 font-medium transition-colors duration-200 text-sm"
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-dark-bg border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors duration-200 shadow-sm"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-5 bg-white hover:bg-gray-50 flex items-center justify-between transition-colors duration-200"
              >
                <h3 className="text-base md:text-lg font-semibold text-black text-left">
                  {section.title}
                </h3>
                <ChevronDown
                  size={20}
                  className={`text-red-600 flex-shrink-0 transition-transform duration-300 ${
                    expandedSection === section.id ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {/* Expanded Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expandedSection === section.id ? "max-h-[1000px]" : "max-h-0"
                }`}
              >
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">
                    {section.content}
                  </p>
                  {section.items && (
                    <ul className="space-y-3">
                      {section.items.map((item, index) => (
                        <li
                          key={index}
                          className="flex gap-3 text-gray-700 text-sm md:text-base"
                        >
                          <span className="text-red-600 font-bold flex-shrink-0 mt-0.5">
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
        <div className="mt-16 bg-black rounded-lg p-8 md:p-10 text-white">
          <h2 className="text-3xl font-bold mb-2">Have Questions?</h2>
          <p className="text-gray-400 mb-8">
            We're here to help. Contact us with any concerns about our Terms &
            Conditions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">✉</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-white">Email</h3>
                <a
                  href="mailto:connect@beetlediffuser.com"
                  className="text-gray-300 hover:text-red-500 transition-colors duration-200 text-sm"
                >
                  connect@beetlediffuser.com
                </a>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">🌐</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-white">Website</h3>
                <a
                  href="https://www.beetlediffuser.com"
                  className="text-gray-300 hover:text-red-500 transition-colors duration-200 text-sm"
                >
                  www.beetlediffuser.com
                </a>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">📋</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-white">Support</h3>
                <p className="text-gray-300 text-sm">
                  Response within
                  <br />5 business days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <p className="text-white-600 text-xs md:text-sm text-center">
            These Terms & Conditions constitute the entire agreement between you
            and Beetle Diffuser regarding your use of our Site and purchase of
            our products. If any provision is found to be invalid or
            unenforceable, the remaining provisions shall remain in full force
            and effect.
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
}
