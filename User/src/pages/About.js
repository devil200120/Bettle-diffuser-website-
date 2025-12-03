import React from "react";
import Footer from "../components/Footer";
import './about.css';

const About = () => {
  return (
    <>
      <section className="about-section">
      <div className="about-container">
        <div className="about-text">
          <h1 className="about-kicker md:text-5xl">About Us</h1>
          <h1 className="about-title">Welcome to Beetle Diffuser</h1>
          <p className="about-subtitle">
            Your trusted destination for premium macro photography diffusers.
          </p>

          <p className="about-body">
            Each diffuser is thoughtfully designed to produce soft, natural
            light that beautifully highlights fine details, minimizes harsh
            reflections, and enhances true-to-life colours in your photos.
          </p>

          <p className="about-body">
            With over a decade of expertise in macro photography and lighting
            design, we've perfected our materials and construction to deliver
            exceptional diffusion and coverage. From our very first model to
            today, every update has been driven by photographers' feedback and
            our passion for improvement.
          </p>

          <p className="about-body">
            Now, our diffusers are available in two refined variants—
            <strong> Pro</strong> and <strong> Lite</strong>—both designed for
            versatility and performance. Each model can be easily dismantled and
            packed flat into the included bag, making it perfect for
            photographers on the move.
          </p>

          <div className="about-badges">
            <span className="badge-chip">10+ Years Experience</span>
            <span className="badge-chip">Photographer‑Driven Design</span>
            <span className="badge-chip">Pro &amp; Lite Variants</span>
          </div>
        </div>

        
      </div>
    </section>

      <Footer />
    </>
  );
};

export default About;
