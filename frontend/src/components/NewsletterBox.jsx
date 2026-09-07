import React, { useState } from "react";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const NewsletterBox = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (!email) return;
    setSubmitted(true);
    toast.success("Thanks for subscribing! Check your inbox for your code.");
    setEmail("");
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <div className="relative overflow-hidden flex flex-col sm:flex-row items-stretch bg-beige-light/60 border border-beige rounded-2xl sm:rounded-3xl my-8 sm:my-12 shadow-sm">
      <div className="relative w-full sm:w-2/5 h-48 sm:h-auto shrink-0">
        <img className="w-full h-full object-cover" src={assets.hero_img} alt="" />
      </div>

      <div className="relative flex-1 flex flex-col justify-center px-6 sm:px-10 py-10 sm:py-8">
        <span className="text-[11px] tracking-[0.2em] uppercase font-medium text-charcoal mb-2">
          Get 10% off your first order
        </span>

        <p className="prata-regular text-2xl sm:text-3xl text-charcoal leading-tight">
          Join Our Style List
        </p>
        <p className="text-gray-500 mt-2 text-sm sm:text-base max-w-sm">
          Sign up for exclusive offers, new arrivals, and style inspiration.
        </p>

        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-0 w-full sm:max-w-md mt-6"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full flex-1 outline-none text-sm py-3 px-5 rounded-full sm:rounded-l-full sm:rounded-r-none bg-white border border-beige focus:border-gold focus:shadow-lg focus:shadow-gold/10 transition-all"
            required
          />
          <button
            className="shrink-0 bg-charcoal text-white text-xs tracking-[0.15em] px-8 py-3 rounded-full sm:rounded-r-full sm:rounded-l-none hover:bg-gold-dark hover:shadow-lg hover:shadow-gold/30 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-70"
            type="submit"
            disabled={submitted}
          >
            {submitted ? "SUBSCRIBED ✓" : "SUBSCRIBE"}
          </button>
        </form>

        <p className="text-[11px] text-gray-400 mt-3">
          No spam, unsubscribe anytime.
        </p>
      </div>
    </div>
  );
};

export default NewsletterBox;
