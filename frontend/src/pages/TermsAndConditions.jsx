import React from 'react'
import LegalPage from '../components/LegalPage'

const TermsAndConditions = () => {
  const sections = [
    {
      heading: 'Using Our Site',
      body: 'By creating an account or placing an order on Stylies, you agree to these terms. You must provide accurate information and are responsible for keeping your account credentials secure.',
    },
    {
      heading: 'Orders & Pricing',
      body: [
        'All prices are listed in the displayed currency and are subject to change without notice.',
        'We reserve the right to refuse or cancel any order, including in cases of pricing errors or stock unavailability.',
        'An order is confirmed only once payment is verified (or, for Cash on Delivery, once the order is placed successfully).',
      ],
    },
    {
      heading: 'Shipping',
      body: 'Free shipping applies to orders above the threshold shown at checkout; a standard delivery charge applies below it. Delivery timelines are estimates and may vary due to location or unforeseen circumstances.',
    },
    {
      heading: 'Returns & Cancellations',
      body: 'Orders can be cancelled (with OTP confirmation) before they are shipped. See our Return Policy for details on returns and refunds after delivery.',
    },
    {
      heading: 'Intellectual Property',
      body: 'All content on this site — including images, logos and text — is the property of Stylies and may not be reproduced without permission.',
    },
    {
      heading: 'Limitation of Liability',
      body: 'We strive for accuracy in product descriptions and pricing but do not guarantee the site will be error-free or uninterrupted. We are not liable for indirect or incidental damages arising from use of the site.',
    },
    {
      heading: 'Changes to These Terms',
      body: 'We may update these terms from time to time. Continued use of the site after changes constitutes acceptance of the updated terms.',
    },
  ]

  return <LegalPage text1='TERMS AND' text2='CONDITIONS' updatedDate='August 2026' sections={sections} />
}

export default TermsAndConditions
