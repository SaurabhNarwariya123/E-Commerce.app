import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const ProductView = ({ token }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [activeImage, setActiveImage] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true)
            try {
                const res = await axios.post(backendUrl + '/api/product/single', { productId: id }, { headers: { token } })
                if (res.data.success) setProduct(res.data.product)
                else toast.error(res.data.message)
            } catch (err) {
                toast.error(err.message)
            }
            setLoading(false)
        }
        fetchProduct()
    }, [id])

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full" />
        </div>
    )

    if (!product) return (
        <div className="text-center text-[var(--adm-muted)] py-12 text-sm">Product not found</div>
    )

    const discountedPrice = product.discountPercent
        ? Math.round(product.price - (product.price * product.discountPercent) / 100)
        : product.price

    const stockTotal = product.stock ? Object.values(product.stock).reduce((s, v) => s + v, 0) : 0

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/admin/list')} className="text-sm text-[var(--adm-muted)] hover:text-[var(--adm-ink)] transition cursor-pointer">
                    ← Back to Products
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col lg:flex-row gap-8">
                {/* Images */}
                <div className="flex flex-col gap-3 w-full lg:w-80 shrink-0">
                    <div className="w-full aspect-3/4 rounded-xl overflow-hidden bg-gray-100">
                        <img className="w-full h-full object-cover" src={product.image[activeImage]} alt={product.name} />
                    </div>
                    <div className="flex gap-2">
                        {product.image.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImage(i)}
                                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition cursor-pointer ${activeImage === i ? 'border-emerald-600' : 'border-transparent hover:border-gray-300'}`}
                            >
                                <img className="w-full h-full object-cover" src={img} alt="" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col gap-5">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-semibold text-[var(--adm-ink)]">{product.name}</h1>
                            {product.bestseller && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">★ Bestseller</span>
                            )}
                        </div>
                        <p className="text-sm text-[var(--adm-muted)] mt-1">{product.category} · {product.subCategory}</p>
                    </div>

                    <p className="text-sm text-[var(--adm-muted)] leading-relaxed">{product.description}</p>

                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-[var(--adm-ink)]">{currency}{discountedPrice}</span>
                        {product.discountPercent > 0 && (
                            <>
                                <span className="text-sm text-[var(--adm-muted)] line-through">{currency}{product.price}</span>
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{product.discountPercent}% OFF</span>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-[var(--adm-muted)] uppercase tracking-wide mb-0.5">Rating</p>
                            <p className="text-sm text-[var(--adm-ink)]">{product.rating != null ? `${product.rating.toFixed(1)} ★ (${product.reviewCount || 0})` : 'No ratings'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--adm-muted)] uppercase tracking-wide mb-0.5">Total Stock</p>
                            <p className="text-sm text-[var(--adm-ink)]">{stockTotal} units</p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--adm-muted)] uppercase tracking-wide mb-0.5">Sizes</p>
                            <p className="text-sm text-[var(--adm-ink)]">{product.sizes?.join(', ') || '—'}</p>
                        </div>
                    </div>

                    {product.stock && Object.keys(product.stock).length > 0 && (
                        <div>
                            <p className="text-xs text-[var(--adm-muted)] uppercase tracking-wide mb-1.5">Stock by Size</p>
                            <div className="flex flex-wrap gap-1.5">
                                {Object.entries(product.stock).map(([size, qty]) => (
                                    <span key={size} className={`text-xs px-2 py-0.5 rounded-full font-medium ${qty <= 5 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-[var(--adm-ink)]'}`}>
                                        {size}: {qty}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {product.colors?.length > 0 && (
                        <div>
                            <p className="text-xs text-[var(--adm-muted)] uppercase tracking-wide mb-1.5">Colors</p>
                            <div className="flex flex-wrap gap-2">
                                {product.colors.map((c, i) => (
                                    <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 border border-gray-200 rounded-full text-xs bg-gray-50">
                                        <span className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ backgroundColor: c.hex }}></span>
                                        {c.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductView
