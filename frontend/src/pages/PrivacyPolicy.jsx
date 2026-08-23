import React from 'react'
import LegalPage from '../components/LegalPage'

const PrivacyPolicy = () => {
  const sections = [
    {
      heading: 'Information We Collect',
      body: [
        'Contact details you provide, such as name, email address, phone number and shipping address.',
        'Order history, cart contents and wishlist items linked to your account.',
        'Payment information, processed securely by our payment partners — we never store your full card details.',
        'Basic usage data such as pages visited and device/browser type, used to improve the site.',
      ],
    },
    {
      heading: 'How We Use Your Information',
      body: [
        'To process and deliver your orders, including sending order and delivery updates.',
        'To provide customer support and respond to your enquiries.',
        'To send optional newsletters and offers — you can unsubscribe at any time.',
        'To improve our products, services and website experience.',
      ],
    },
    {
      heading: 'Sharing Your Information',
      body: 'We do not sell your personal information. We share data only with trusted service providers (payment processors, delivery partners, email services) strictly to fulfil your orders, and only to the extent necessary.',
    },
    {
      heading: 'Data Security',
      body: 'Your password is stored encrypted, and authentication uses secure HttpOnly cookies. We use industry-standard measures to protect your data, though no online system can be guaranteed 100% secure.',
    },
    {
      heading: 'Your Rights',
      body: [
        'Access, update or delete your saved addresses and account details from your profile.',
        'Request deletion of your account and associated data by contacting us.',
        'Opt out of marketing emails at any time.',
      ],
    },
    {
      heading: 'Contact Us',
      body: 'For any privacy-related questions, reach out to us at saurabhnarwariya2019@gmail.com.',
    },
  ]

  return <LegalPage text1='PRIVACY' text2='POLICY' updatedDate='August 2026' sections={sections} />
}

export default PrivacyPolicy
