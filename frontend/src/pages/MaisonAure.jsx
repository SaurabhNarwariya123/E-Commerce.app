import React, { useState } from 'react'
import ShaderBackground from '../maison-aure/ShaderBackground'
import GoldRibbon from '../maison-aure/GoldRibbon'
import '../maison-aure/maison-aure.css'

const CART_ITEMS = [
  { id: 1, name: 'The Silk Wrap Gown', meta: 'Noir · Size FR 38', price: 1180, swatch: 'linear-gradient(160deg, #14100f, #3a2a1c)' },
  { id: 2, name: 'Structured Velvet Clutch', meta: 'Wine · One Size', price: 420, swatch: 'linear-gradient(160deg, #5a2a2f, #2c1215)' },
  { id: 3, name: 'Hand-Beaded Sash Belt', meta: 'Gold · One Size', price: 260, swatch: 'linear-gradient(160deg, #cba656, #8a6d34)' },
]

const FOOTER_COLUMNS = [
  {
    title: 'Support',
    links: ['Contact Concierge', 'Shipping & Returns', 'Size Guide', 'Order Tracking', 'FAQ'],
  },
  {
    title: 'Maison',
    links: ['Our Story', 'Ateliers', 'Sustainability', 'Careers', 'Press'],
  },
  {
    title: 'Explore',
    links: ['New Arrivals', 'Ready-to-Wear', 'Accessories', 'Gift Cards', 'Private Appointments'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Preferences', 'Accessibility'],
  },
]

const subtotal = CART_ITEMS.reduce((sum, item) => sum + item.price, 0)
const shipping = 0
const total = subtotal + shipping

export default function MaisonAure() {
  const [qty, setQty] = useState(() => Object.fromEntries(CART_ITEMS.map((i) => [i.id, 1])))

  return (
    <div className="ma-root">
      <ShaderBackground />
      <GoldRibbon />

      <div className="ma-content">
        <nav className="ma-nav">
          <a href="#" className="ma-logo">MAISON <em>AURÉ</em></a>
          <div className="ma-nav-links">
            <a href="#collection">Collection</a>
            <a href="#checkout">Checkout</a>
            <a href="#contact">Concierge</a>
          </div>
        </nav>

        <section className="ma-hero ma-stagger" id="collection">
          <div>
            <span className="ma-eyebrow">Autumn Reverie</span>
            <h1 className="ma-heading" style={{ marginTop: '1.25rem' }}>
              Woven in<br />Candlelight
            </h1>
            <p className="ma-body-copy" style={{ marginTop: '1.5rem', maxWidth: '46ch' }}>
              Each silhouette is cut by hand from mulberry silk and finished with
              hand-set gold thread — a quiet luxury made for evenings that linger.
            </p>
            <div style={{ marginTop: '2.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="ma-cta">Add to Cart</button>
              <button className="ma-cta ma-cta--outline">View Lookbook</button>
            </div>
          </div>

          <div className="ma-glass-card ma-product-image" style={{ background: 'linear-gradient(150deg, #241a14, #5a2a2f 55%, #0b0b0d)' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: '1.5rem' }}>
              <div>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: 'var(--cream)', margin: 0 }}>
                  The Silk Wrap Gown
                </p>
                <p className="ma-price" style={{ marginTop: '0.35rem' }}>$1,180</p>
              </div>
            </div>
          </div>
        </section>

        <section className="ma-section" id="checkout">
          <h2 className="ma-section-title">Your Selection</h2>

          <div className="ma-checkout-grid">
            <div className="ma-stagger">
              {CART_ITEMS.map((item) => (
                <div className="ma-cart-item" key={item.id}>
                  <div style={{ width: 84, height: 104, borderRadius: 3, background: item.swatch, border: '1px solid rgba(203,166,86,0.2)' }} />
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p className="ma-cart-item-name">{item.name}</p>
                      <p className="ma-cart-item-meta">{item.meta}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.75rem' }}>
                        <button
                          aria-label="Decrease quantity"
                          onClick={() => setQty((q) => ({ ...q, [item.id]: Math.max(1, q[item.id] - 1) }))}
                          style={{ width: 26, height: 26, border: '1px solid rgba(203,166,86,0.3)', background: 'transparent', color: 'var(--gold-bright)', cursor: 'pointer', borderRadius: 2 }}
                        >−</button>
                        <span style={{ fontSize: '0.85rem', minWidth: 16, textAlign: 'center' }}>{qty[item.id]}</span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() => setQty((q) => ({ ...q, [item.id]: q[item.id] + 1 }))}
                          style={{ width: 26, height: 26, border: '1px solid rgba(203,166,86,0.3)', background: 'transparent', color: 'var(--gold-bright)', cursor: 'pointer', borderRadius: 2 }}
                        >+</button>
                      </div>
                    </div>
                    <p className="ma-price">${(item.price * qty[item.id]).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="ma-glass-card ma-summary-card ma-fade-up-card">
              <p className="ma-eyebrow" style={{ marginBottom: '1.5rem' }}>Order Summary</p>
              <div className="ma-summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="ma-summary-row">
                <span>Shipping</span>
                <span style={{ color: 'var(--gold-bright)' }}>Complimentary</span>
              </div>
              <div className="ma-summary-row">
                <span>Estimated Tax</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="ma-summary-row ma-summary-row--total">
                <span>Total</span>
                <span className="ma-price">${total.toLocaleString()}</span>
              </div>
              <button className="ma-cta" style={{ width: '100%', marginTop: '1.5rem' }}>
                Proceed to Checkout
              </button>
              <p style={{ fontSize: '0.7rem', color: 'rgba(243,237,226,0.4)', textAlign: 'center', marginTop: '1rem', letterSpacing: '0.04em' }}>
                Secure Checkout · Complimentary Gift Wrapping
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer className="ma-footer" id="contact">
        <div className="ma-footer-grid">
          <div className="ma-footer-brand">
            <a href="#" className="ma-logo">MAISON <em>AURÉ</em></a>
            <p>Quiet luxury, hand-finished. Editorial minimalism for the modern wardrobe, crafted in small ateliers.</p>
            <div className="ma-footer-social">
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="Pinterest">PT</a>
              <a href="#" aria-label="X">X</a>
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div className="ma-footer-col" key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link}><a href="#">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="ma-footer-bottom">
          <span>© 2026 Maison Auré. All rights reserved.</span>
          <div className="ma-footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
