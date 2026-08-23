import React, { useState } from "react";
import { toast } from "react-toastify";

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
    <div className="relative overflow-hidden text-center bg-linear-to-br from-beige-light via-ivory to-rose/10 border border-beige rounded-2xl sm:rounded-3xl py-12 sm:py-16 px-5 sm:px-10 my-8 sm:my-12 shadow-sm">
      {/* decorative glows */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-44 sm:w-64 h-44 sm:h-64 rounded-full bg-gold/20 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-44 sm:w-64 h-44 sm:h-64 rounded-full bg-rose/15 blur-3xl"></div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(184,147,90,0.08),transparent_60%)]"></div>

      <span className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-dark text-[11px] tracking-[0.2em] uppercase font-medium mb-4">
        Exclusive Offer
      </span>

      <p className="relative prata-regular text-2xl sm:text-3xl md:text-4xl text-charcoal leading-tight">
        Subscribe now &amp; get{" "}
        <span className="gold-gradient-text font-medium">20% off</span>
      </p>
      <p className="relative text-gray-500 mt-3 text-sm sm:text-base max-w-md mx-auto">
        Be the first to know about new arrivals, exclusive offers, and more.
      </p>

      <form
        onSubmit={onSubmitHandler}
        className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-0 w-full sm:w-[26rem] mx-auto my-7"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full flex-1 outline-none text-sm py-3.5 sm:py-3 px-5 rounded-full sm:rounded-l-full sm:rounded-r-none bg-white border border-beige focus:border-gold focus:shadow-lg focus:shadow-gold/10 transition-all"
          required
        />
        <button
          className="shrink-0 bg-charcoal text-white text-xs tracking-[0.15em] px-8 py-3.5 rounded-full sm:rounded-r-full sm:rounded-l-none hover:bg-gold-dark hover:shadow-lg hover:shadow-gold/30 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-70"
          type="submit"
          disabled={submitted}
        >
          {submitted ? "SUBSCRIBED ✓" : "SUBSCRIBE"}
        </button>
      </form>

      <p className="relative text-[11px] text-gray-400">
        No spam, unsubscribe anytime.
      </p>
    </div>
  );
};

export default NewsletterBox;
