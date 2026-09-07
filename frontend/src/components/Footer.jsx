import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import * as THREE from "three";

const SocialIcon = ({ path, href, label }) => {
  const [hovered, setHovered] = useState(false);
  const mountRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const size = 44;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    mount.appendChild(renderer.domElement);

    const ringCount = 24;
    const positions = new Float32Array(ringCount * 3);
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * 1.15;
      positions[i * 3 + 1] = Math.sin(angle) * 1.15;
      positions[i * 3 + 2] = 0;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xfff4d6,
      size: 0.14,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let frameId;
    const animate = () => {
      const s = stateRef.current;
      const targetOpacity = s.hovered ? 0.9 : 0;
      material.opacity += (targetOpacity - material.opacity) * 0.12;
      points.rotation.z += s.hovered ? 0.03 : 0.006;
      const targetScale = s.hovered ? 1 : 0.85;
      points.scale.x += (targetScale - points.scale.x) * 0.15;
      points.scale.y += (targetScale - points.scale.y) * 0.15;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    stateRef.current.hovered = hovered;
  }, [hovered]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-9 h-9 flex items-center justify-center group"
    >
      <div
        ref={mountRef}
        className="pointer-events-none absolute inset-0 -m-[2.5px] flex items-center justify-center"
      />
      <span
        className={`absolute inset-0 rounded-full border transition-all duration-300 ${
          hovered
            ? "border-[#fff4d6] shadow-[0_0_14px_2px_rgba(255,244,214,0.55)] scale-110"
            : "border-ivory/20 scale-100"
        }`}
      />
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`relative z-10 transition-all duration-300 ${
          hovered ? "text-[#fff4d6] scale-110" : "text-ivory/70 scale-100"
        }`}
      >
        <path d={path} />
      </svg>
    </a>
  );
};

const INSTAGRAM_URL = "https://www.instagram.com/saurabh_lodhi_706/";
const TWITTER_URL = "https://x.com/LodhiSaurabh706";
const WHATSAPP_URL = "https://wa.me/916397496753";
const GITHUB_URL = "https://github.com/SaurabhNarwariya123";
const LINKEDIN_URL = "https://www.linkedin.com/";
const CONTACT_EMAIL = "saurabhnarwariya2019@gmail.com";

const Footer = () => {
  const [email, setEmail] = useState("");

  const onSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thanks for subscribing! Check your inbox for your code.");
    setEmail("");
  };

  return (
    <div className="relative overflow-hidden bg-charcoal mt-20">
      <div className="pointer-events-none absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-gold to-transparent"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.3fr] gap-10 py-16 px-6 sm:px-10 max-w-7xl mx-auto">
        {/* Brand */}
        <div>
          <img src={assets.logo} className="mb-4 w-32 brightness-0 invert opacity-90" alt="Forever" />
          <p className="text-ivory/50 leading-relaxed text-sm max-w-xs">
            Timeless fashion for every moment. Designed with you in mind.
          </p>
          <div className="flex items-center gap-2.5 mt-6">
            <SocialIcon
              href={INSTAGRAM_URL}
              label="Instagram"
              path="M12 2.2c3.2 0 3.6 0 4.9.07 3.3.15 4.8 1.7 4.9 4.9.07 1.3.07 1.6.07 4.8 0 3.2 0 3.6-.07 4.9-.15 3.2-1.7 4.8-4.9 4.9-1.3.07-1.6.07-4.9.07-3.2 0-3.6 0-4.9-.07-3.3-.15-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.07-4.9.15-3.2 1.7-4.8 4.9-4.9C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.07-2.4.1-3.5 1.2-3.6 3.6C3.6 8.7 3.6 9 3.6 12s0 3.3.07 4.4c.1 2.4 1.2 3.5 3.6 3.6 1.2.06 1.6.07 4.7.07s3.5 0 4.7-.07c2.4-.1 3.5-1.2 3.6-3.6.06-1.2.07-1.6.07-4.4s0-3.3-.07-4.4c-.1-2.4-1.2-3.5-3.6-3.6C15.5 4 15.1 4 12 4zm0 3.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4zm0 1.8a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8zm5-2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z"
            />
            <SocialIcon
              href={TWITTER_URL}
              label="X (Twitter)"
              path="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-7.2L4.5 22H1.4l8.1-9.3L1 2h7.2l5 6.6L18.9 2zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20z"
            />
            <SocialIcon
              href={WHATSAPP_URL}
              label="WhatsApp"
              path="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 0 1 6.9 12.6l-.3.5.6 2.3-2.3-.6-.5.3A8.2 8.2 0 1 1 12 3.8zm-3.3 4a.9.9 0 0 0-.7.3c-.2.3-.9 1-.9 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.9 4.3 2.4 1 2.9.8 3.4.7.6-.1 1.7-.7 2-1.4.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.5-.3l-2-1c-.3-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.6-1.9-.1-.3 0-.4.1-.5l.6-.6c.2-.2.2-.3.3-.5.1-.2.1-.4 0-.5l-.9-2.1c-.2-.5-.4-.4-.6-.4h-.5z"
            />
            <SocialIcon
              href={GITHUB_URL}
              label="GitHub"
              path="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.1-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.8-2.4 4.6-4.6 4.9.3.3.6.9.6 1.8v2.6c0 .3.2.6.7.5A10 10 0 0 0 22 12c0-5.5-4.5-10-10-10z"
            />
            <SocialIcon
              href={LINKEDIN_URL}
              label="LinkedIn"
              path="M4.98 3.5C4.98 4.9 3.9 6 2.5 6S0 4.9 0 3.5 1.1 1 2.5 1s2.48 1.1 2.48 2.5zM.24 8.25h4.5V23h-4.5V8.25zM8.4 8.25h4.31v2.02h.06c.6-1.1 2.06-2.26 4.24-2.26 4.53 0 5.37 2.9 5.37 6.68V23h-4.5v-6.86c0-1.64-.03-3.74-2.28-3.74-2.29 0-2.64 1.76-2.64 3.62V23H8.4V8.25z"
            />
            <SocialIcon
              href={`mailto:${CONTACT_EMAIL}`}
              label="Email"
              path="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.5 2.3V17h15V7.3l-7.5 5.6-7.5-5.6zm.9-.6L12 11.4l6.6-4.7H5.4z"
            />
          </div>
        </div>

        {/* Shop */}
        <div>
          <p className="text-ivory text-sm font-semibold tracking-[0.15em] uppercase mb-5">Shop</p>
          <ul className="flex flex-col gap-2.5 text-ivory/50 text-sm">
            <li><Link to="/collection" className="hover:text-ivory transition-colors inline-block w-fit">All Products</Link></li>
            <li><Link to="/collection" className="hover:text-ivory transition-colors inline-block w-fit">New Arrivals</Link></li>
            <li><Link to="/collection" className="hover:text-ivory transition-colors inline-block w-fit">Women</Link></li>
            <li><Link to="/collection" className="hover:text-ivory transition-colors inline-block w-fit">Men</Link></li>
            <li><Link to="/wishlist" className="hover:text-ivory transition-colors inline-block w-fit">Wishlist</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <p className="text-ivory text-sm font-semibold tracking-[0.15em] uppercase mb-5">Customer Care</p>
          <ul className="flex flex-col gap-2.5 text-ivory/50 text-sm">
            <li><Link to="/contact" className="hover:text-ivory transition-colors inline-block w-fit">Contact Us</Link></li>
            <li><Link to="/orders" className="hover:text-ivory transition-colors inline-block w-fit">Track Order</Link></li>
            <li><Link to="/return-policy" className="hover:text-ivory transition-colors inline-block w-fit">Returns &amp; Exchanges</Link></li>
            <li><Link to="/faq" className="hover:text-ivory transition-colors inline-block w-fit">FAQs</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-ivory transition-colors inline-block w-fit">Privacy Policy</Link></li>
            <li><Link to="/terms-and-conditions" className="hover:text-ivory transition-colors inline-block w-fit">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

        {/* Stay Connected */}
        <div>
          <p className="text-ivory text-sm font-semibold tracking-[0.15em] uppercase mb-5">Stay Connected</p>
          <p className="text-ivory/50 text-sm mb-4">Sign up for updates and get 10% off your first order.</p>
          <form onSubmit={onSubscribe} className="flex items-center gap-0 mb-5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="min-w-0 flex-1 bg-ivory/5 border border-ivory/20 text-ivory placeholder:text-ivory/40 text-sm px-4 py-2.5 rounded-l-full outline-none focus:border-gold transition-colors"
            />
            <button type="submit" className="shrink-0 bg-gold text-charcoal text-sm font-medium px-4 py-2.5 rounded-r-full hover:bg-gold-light transition-colors cursor-pointer">
              →
            </button>
          </form>
          <a href="tel:+916397496753" className="block text-ivory/50 hover:text-ivory transition-colors text-sm w-fit">6397496753</a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="block text-ivory/50 hover:text-ivory transition-colors text-sm w-fit">{CONTACT_EMAIL}</a>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <p className="py-5 text-xs text-center text-ivory/40 tracking-wide">© 2025 Forever.com — All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Footer;
