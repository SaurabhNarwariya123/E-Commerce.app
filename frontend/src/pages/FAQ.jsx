import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import { ShopContext } from '../context/ShopContext'

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className={`rounded-2xl border bg-white transition-all duration-300 ${isOpen ? 'border-gold/50 shadow-md' : 'border-beige shadow-sm hover:border-gold/30'}`}>
    <button
      type='button'
      onClick={onClick}
      className='w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer'
    >
      <span className={`text-base sm:text-lg font-medium transition-colors ${isOpen ? 'text-gold-dark' : 'text-charcoal'}`}>{question}</span>
      <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none transition-all duration-300 ${isOpen ? 'rotate-45 bg-gold text-white' : 'bg-beige-light text-gold-dark'}`}>+</span>
    </button>
    <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
      <div className='overflow-hidden'>
        <p className='text-gray-600 text-sm sm:text-[15px] leading-relaxed px-5 pb-5'>{answer}</p>
      </div>
    </div>
  </div>
)

const FAQ = () => {
  const { currency, freeDeliveryThreshold } = useContext(ShopContext)
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = [
    {
      question: 'How long does delivery take?',
      answer: 'Most orders are delivered within 3–7 business days depending on your location. You can track your order live from the Orders page once it ships.',
    },
    {
      question: `Is shipping free?`,
      answer: `Yes — shipping is free on orders over ${currency}${freeDeliveryThreshold}. Below that, a standard delivery charge applies at checkout.`,
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 7-day free return policy on unused items in original packaging. See our Return Policy page for full details.',
    },
    {
      question: 'Can I cancel my order?',
      answer: 'Yes, you can cancel an order before it ships. Go to My Orders, select the order, and request cancellation — we\'ll send an OTP to your email to confirm.',
    },
    {
      question: 'How do I track my order?',
      answer: 'Open My Orders from your account menu and select the order to see live status and, where available, real-time delivery tracking.',
    },
    {
      question: 'Do you offer gift wrapping?',
      answer: 'Yes — at checkout, tick "This is a gift" to have your order gift-wrapped with an optional personal message.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Cash on Delivery, as well as secure online payments via Stripe and Razorpay.',
    },
    {
      question: 'How can I contact support?',
      answer: 'Reach us anytime via the Contact page, or email saurabhnarwariya2019@gmail.com.',
    },
  ]

  return (
    <div className='pt-10 pb-16 border-t border-beige max-w-2xl mx-auto'>
      <div className='text-center mb-3'>
        <Title text1={'FREQUENTLY ASKED'} text2={'QUESTIONS'} large />
      </div>
      <p className='text-center text-sm text-gray-500 mb-10'>Quick answers about delivery, returns, payments and more.</p>

      <div className='flex flex-col gap-3'>
        {faqs.map((faq, i) => (
          <FAQItem
            key={i}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === i}
            onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </div>
  )
}

export default FAQ
