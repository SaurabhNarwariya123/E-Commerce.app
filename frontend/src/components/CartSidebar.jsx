import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'

const CartSidebar = () => {
    const {
        showCartSidebar, setShowCartSidebar,
        cartItems, products, currency,
        updateQuantity, getCartAmount, navigate
    } = useContext(ShopContext)

    const items = []
    for (const itemId in cartItems) {
        for (const size in cartItems[itemId]) {
            if (cartItems[itemId][size] > 0) {
                const product = products.find(p => p._id === itemId)
                if (product) items.push({ product, size, qty: cartItems[itemId][size] })
            }
        }
    }

    const close = () => setShowCartSidebar(false)

    const handleCheckout = () => { close(); navigate('/place-order') }
    const handleViewCart = () => { close(); navigate('/cart') }

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-charcoal/50 z-40 transition-opacity duration-300 ${showCartSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={close}
            />

            {/* Right drawer */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${showCartSidebar ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-beige shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🛒</span>
                        <h2 className="text-base font-semibold text-charcoal">
                            Your Cart
                            {items.length > 0 && (
                                <span className="ml-2 text-xs bg-gold text-white rounded-full px-2 py-0.5">{items.length}</span>
                            )}
                        </h2>
                    </div>
                    <button onClick={close} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-beige-light text-gray-500 hover:text-charcoal transition text-lg leading-none">
                        ✕
                    </button>
                </div>

                {/* Items list */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                            <span className="text-4xl">🛍️</span>
                            <p className="text-gray-500 text-sm font-medium">Your cart is empty</p>
                            <button
                                onClick={() => { close(); navigate('/collection') }}
                                className="text-xs bg-charcoal text-white px-4 py-2 rounded-full hover:bg-black transition"
                            >
                                Shop Now
                            </button>
                        </div>
                    ) : (
                        items.map(({ product, size, qty }) => (
                            <div key={`${product._id}-${size}`} className="flex gap-3 bg-beige-light/50 rounded-xl p-3 group">
                                <img
                                    src={product.image?.[0]}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-lg shrink-0 cursor-pointer"
                                    onClick={() => { close(); navigate(`/product/${product._id}`) }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-charcoal truncate leading-tight">{product.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Size: <span className="font-medium text-gray-600">{size}</span></p>

                                    <div className="flex items-center justify-between mt-2">
                                        {/* Qty controls */}
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => updateQuantity(product._id, size, qty - 1)}
                                                className="w-6 h-6 rounded-full bg-white border border-beige text-xs flex items-center justify-center hover:bg-beige-light transition font-bold"
                                            >−</button>
                                            <span className="text-xs font-semibold w-5 text-center">{qty}</span>
                                            <button
                                                onClick={() => updateQuantity(product._id, size, qty + 1)}
                                                className="w-6 h-6 rounded-full bg-white border border-beige text-xs flex items-center justify-center hover:bg-beige-light transition font-bold"
                                            >+</button>
                                        </div>
                                        <p className="text-sm font-bold text-charcoal">{currency}{(product.price * qty).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-beige px-5 py-4 space-y-3 shrink-0 bg-white">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Subtotal</span>
                            <span className="text-base font-bold text-charcoal">{currency}{getCartAmount().toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-400">Shipping & taxes calculated at checkout</p>
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-gold text-white py-3 rounded-full text-sm font-semibold hover:bg-gold-dark active:scale-95 transition-all"
                        >
                            Checkout →
                        </button>
                        <button
                            onClick={handleViewCart}
                            className="w-full border border-beige text-charcoal py-2.5 rounded-full text-sm hover:bg-beige-light transition"
                        >
                            View Full Cart
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

export default CartSidebar
