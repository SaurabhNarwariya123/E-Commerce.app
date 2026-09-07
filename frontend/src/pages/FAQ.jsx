import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import { ShopContext } from '../context/ShopContext'

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className='border-b border-beige'>
    <button
      type='button'
      onClick={onClick}
      className='w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer'
    >
      <span className='text-sm sm:text-base font-medium text-charcoal'>{question}</span>
      <span className={`shrink-0 text-charcoal text-xl leading-none transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>+</span>
    </button>
    <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
      <div className='overflow-hidden'>
        <p className='text-gray-500 text-sm leading-relaxed pb-4'>{answer}</p>
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
    <div className='pt-8 pb-16 border-t border-beige max-w-2xl mx-auto'>
      <div className='text-center mb-10'>
        <Title text1={'FREQUENTLY ASKED'} text2={'QUESTIONS'} />
      </div>

      <div>
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
