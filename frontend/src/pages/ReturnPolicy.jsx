import React from 'react'
import LegalPage from '../components/LegalPage'

const ReturnPolicy = () => {
  const sections = [
    {
      heading: 'Return Window',
      body: 'We offer a 7-day free return policy from the date of delivery. Items must be unused, unwashed and in their original packaging with tags attached.',
    },
    {
      heading: 'How to Start a Return',
      body: [
        'Go to My Orders and select the item you wish to return.',
        'Choose a reason for the return and submit your request.',
        'Our team will arrange a pickup or share drop-off instructions.',
      ],
    },
    {
      heading: 'Exchanges',
      body: 'We offer a hassle-free exchange policy for size or color issues, subject to stock availability. Exchanges follow the same 7-day window as returns.',
    },
    {
      heading: 'Refunds',
      body: 'Once your returned item is received and inspected, refunds are processed to your original payment method within 5–7 business days. Cash on Delivery orders are refunded via bank transfer or store credit.',
    },
    {
      heading: 'Non-Returnable Items',
      body: 'Sale items marked as "final sale" and gift cards are not eligible for return.',
    },
    {
      heading: 'Need Help?',
      body: 'Contact our support team any time at saurabhnarwariya2019@gmail.com or through the Contact page.',
    },
  ]

  return <LegalPage text1='RETURN' text2='POLICY' updatedDate='August 2026' sections={sections} />
}

export default ReturnPolicy
