// Store policy text the assistant may quote. Mirrors the customer-facing pages
// (frontend/src/pages: ReturnPolicy, PrivacyPolicy, TermsAndConditions, FAQ).
// When one of those pages changes, update it here and run `npm run rag:index`.
const SUPPORT = 'saurabhnarwariya2019@gmail.com'

export const POLICIES = [
    {
        slug: 'return-policy',
        title: 'Return Policy',
        sections: [
            { heading: 'Return Window', body: 'We offer a 7-day free return policy from the date of delivery. Items must be unused, unwashed and in their original packaging with tags attached.' },
            { heading: 'How to Start a Return', body: ['Go to My Orders and select the item you wish to return.', 'Choose a reason for the return and submit your request.', 'Our team will arrange a pickup or share drop-off instructions.'] },
            { heading: 'Exchanges', body: 'We offer a hassle-free exchange policy for size or color issues, subject to stock availability. Exchanges follow the same 7-day window as returns.' },
            { heading: 'Refunds', body: 'Once your returned item is received and inspected, refunds are processed to your original payment method within 5-7 business days. Cash on Delivery orders are refunded via bank transfer or store credit.' },
            { heading: 'Non-Returnable Items', body: 'Sale items marked as "final sale" and gift cards are not eligible for return.' },
            { heading: 'Need Help?', body: `Contact our support team any time at ${SUPPORT} or through the Contact page.` },
        ],
    },
    {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        sections: [
            { heading: 'Information We Collect', body: ['Contact details you provide, such as name, email address, phone number and shipping address.', 'Order history, cart contents and wishlist items linked to your account.', 'Payment information, processed securely by our payment partners - we never store your full card details.', 'Basic usage data such as pages visited and device/browser type, used to improve the site.'] },
            { heading: 'How We Use Your Information', body: ['To process and deliver your orders, including sending order and delivery updates.', 'To provide customer support and respond to your enquiries.', 'To send optional newsletters and offers - you can unsubscribe at any time.', 'To improve our products, services and website experience.'] },
            { heading: 'Sharing Your Information', body: 'We do not sell your personal information. We share data only with trusted service providers (payment processors, delivery partners, email services) strictly to fulfil your orders, and only to the extent necessary.' },
            { heading: 'Data Security', body: 'Your password is stored encrypted, and authentication uses secure HttpOnly cookies. We use industry-standard measures to protect your data, though no online system can be guaranteed 100% secure.' },
            { heading: 'Your Rights', body: ['Access, update or delete your saved addresses and account details from your profile.', 'Request deletion of your account and associated data by contacting us.', 'Opt out of marketing emails at any time.'] },
            { heading: 'Contact Us', body: `For any privacy-related questions, reach out to us at ${SUPPORT}.` },
        ],
    },
    {
        slug: 'terms-and-conditions',
        title: 'Terms and Conditions',
        sections: [
            { heading: 'Using Our Site', body: 'By creating an account or placing an order on Stylies, you agree to these terms. You must provide accurate information and are responsible for keeping your account credentials secure.' },
            { heading: 'Orders & Pricing', body: ['All prices are listed in the displayed currency and are subject to change without notice.', 'We reserve the right to refuse or cancel any order, including in cases of pricing errors or stock unavailability.', 'An order is confirmed only once payment is verified (or, for Cash on Delivery, once the order is placed successfully).'] },
            { heading: 'Shipping', body: 'Free shipping applies to orders above the threshold shown at checkout; a standard delivery charge applies below it. Delivery timelines are estimates and may vary due to location or unforeseen circumstances.' },
            { heading: 'Returns & Cancellations', body: 'Orders can be cancelled (with OTP confirmation) before they are shipped. See our Return Policy for details on returns and refunds after delivery.' },
            { heading: 'Intellectual Property', body: 'All content on this site - including images, logos and text - is the property of Stylies and may not be reproduced without permission.' },
            { heading: 'Limitation of Liability', body: 'We strive for accuracy in product descriptions and pricing but do not guarantee the site will be error-free or uninterrupted. We are not liable for indirect or incidental damages arising from use of the site.' },
            { heading: 'Changes to These Terms', body: 'We may update these terms from time to time. Continued use of the site after changes constitutes acceptance of the updated terms.' },
        ],
    },
    {
        slug: 'faq',
        title: 'FAQ',
        sections: [
            { heading: 'How long does delivery take?', body: 'Most orders are delivered within 3-7 business days depending on your location. You can track your order live from the Orders page once it ships.' },
            { heading: 'Is shipping free?', body: 'Yes - shipping is free on orders over the free-delivery threshold (currently $350). Below that, a standard delivery charge of $10 applies at checkout.' },
            { heading: 'What is your return policy?', body: 'We offer a 7-day free return policy on unused items in original packaging. See the Return Policy page for full details.' },
            { heading: 'Can I cancel my order?', body: "Yes, you can cancel an order before it ships. Go to My Orders, select the order, and request cancellation - we'll send an OTP to your email to confirm." },
            { heading: 'How do I track my order?', body: 'Open My Orders from your account menu and select the order to see live status and, where available, real-time delivery tracking.' },
            { heading: 'Do you offer gift wrapping?', body: 'Yes - at checkout, tick "This is a gift" to have your order gift-wrapped with an optional personal message.' },
            { heading: 'What payment methods do you accept?', body: 'We accept Cash on Delivery, as well as secure online payments via Stripe and Razorpay.' },
            { heading: 'How can I contact support?', body: `Reach us anytime via the Contact page, or email ${SUPPORT}.` },
        ],
    },
]
