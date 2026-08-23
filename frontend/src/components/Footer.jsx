import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="relative overflow-hidden bg-linear-to-b from-beige-light/50 to-beige-light/70 mt-20 border-t border-beige">
      <div className='pointer-events-none absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-gold to-transparent'></div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 py-14 text-sm px-1">
        <div>
          <img src={assets.logo} className="mb-5 w-32 transition-transform duration-300 hover:scale-105" alt="" />
          <p className="w-full md:w-2/3 text-gray-500 leading-relaxed">
            Timeless fabrics, thoughtfully sourced. Elevated everyday essentials
            crafted with quality and care.
          </p>
        </div>

        <div>
            <p className="prata-regular text-charcoal mb-5">Company</p>
            <ul className="flex flex-col gap-2 text-gray-500">
                <li><Link to="/" className="hover:text-gold-dark hover:translate-x-1 transition-all inline-block w-fit">Home</Link></li>
                <li><Link to="/about" className="hover:text-gold-dark hover:translate-x-1 transition-all inline-block w-fit">About</Link></li>
                <li><Link to="/faq" className="hover:text-gold-dark hover:translate-x-1 transition-all inline-block w-fit">FAQ</Link></li>
                <li><Link to="/return-policy" className="hover:text-gold-dark hover:translate-x-1 transition-all inline-block w-fit">Returns</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-gold-dark hover:translate-x-1 transition-all inline-block w-fit">Privacy Policy</Link></li>
                <li><Link to="/terms-and-conditions" className="hover:text-gold-dark hover:translate-x-1 transition-all inline-block w-fit">Terms &amp; Conditions</Link></li>
            </ul>
        </div>

         <div>
            <p className="prata-regular text-charcoal mb-5">Get in Touch</p>
            <ul className="flex flex-col gap-2 text-gray-500">
                <li className="hover:text-gold-dark transition-colors w-fit">6397496753</li>
                <li className="hover:text-gold-dark transition-colors w-fit">saurabhnarwariya2019@gmail.com</li>
            </ul>
         </div>
      </div>

      <div className="border-t border-beige">
          <p className="py-5 text-xs text-center text-gray-400 tracking-wide"> © 2025 Forever.com — All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Footer;
