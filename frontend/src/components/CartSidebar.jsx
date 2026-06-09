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
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${showCartSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={close}
            />

            {/* Right drawer */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${showCartSidebar ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🛒</span>
                        <h2 className="text-base font-semibold text-gray-900">
                            Your Cart
                            {items.length > 0 && (
                                <span className="ml-2 text-xs bg-black text-white rounded-full px-2 py-0.5">{items.length}</span>
                            )}
                        </h2>
                    </div>
                    <button onClick={close} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition text-lg leading-none">
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
                                className="text-xs bg-black text-white px-4 py-2 rounded-full hover:bg-gray-900 transition"
                            >
                                Shop Now
                            </button>
                        </div>
                    ) : (
                        items.map(({ product, size, qty }) => (
                            <div key={`${product._id}-${size}`} className="flex gap-3 bg-gray-50 rounded-xl p-3 group">
                                <img
                                    src={product.image?.[0]}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-lg shrink-0 cursor-pointer"
                                    onClick={() => { close(); navigate(`/product/${product._id}`) }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate leading-tight">{product.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Size: <span className="font-medium text-gray-600">{size}</span></p>

                                    <div className="flex items-center justify-between mt-2">
                                        {/* Qty controls */}
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => updateQuantity(product._id, size, qty - 1)}
                                                className="w-6 h-6 rounded-full bg-white border border-gray-300 text-xs flex items-center justify-center hover:bg-gray-100 transition font-bold"
                                            >−</button>
                                            <span className="text-xs font-semibold w-5 text-center">{qty}</span>
                                            <button
                                                onClick={() => updateQuantity(product._id, size, qty + 1)}
                                                className="w-6 h-6 rounded-full bg-white border border-gray-300 text-xs flex items-center justify-center hover:bg-gray-100 transition font-bold"
                                            >+</button>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">{currency}{(product.price * qty).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t px-5 py-4 space-y-3 shrink-0 bg-white">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Subtotal</span>
                            <span className="text-base font-bold text-gray-900">{currency}{getCartAmount().toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-400">Shipping & taxes calculated at checkout</p>
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-900 active:scale-95 transition-all"
                        >
                            Checkout →
                        </button>
                        <button
                            onClick={handleViewCart}
                            className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
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
