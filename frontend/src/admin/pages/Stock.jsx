import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const LOW_THRESHOLD = 5

const Stock = ({ token }) => {
    const [products, setProducts] = useState([])
    const [loading, setLoading]   = useState(true)
    const [editing, setEditing]   = useState(null)   // productId being edited
    const [draft, setDraft]       = useState({})     // { size: qty }
    const [saving, setSaving]     = useState(false)
    const [search, setSearch]     = useState('')
    const [filter, setFilter]     = useState('all')  // 'all' | 'low'
    const headers = { headers: { token } }

    const fetchStock = async () => {
        setLoading(true)
        try {
            const res = await axios.get(backendUrl + '/api/stock/list', headers)
            if (res.data.success) setProducts(res.data.products)
        } catch (_) {}
        setLoading(false)
    }

    useEffect(() => { fetchStock() }, [token])

    const startEdit = (product) => {
        const current = {}
        if (product.stock) {
            for (const [size, qty] of Object.entries(product.stock)) {
                current[size] = qty
            }
        } else {
            (product.sizes || []).forEach(s => { current[s] = 0 })
        }
        setDraft(current)
        setEditing(product._id)
    }

    const saveStock = async (productId) => {
        setSaving(true)
        try {
            const stock = {}
            for (const [k, v] of Object.entries(draft)) {
                stock[k] = Number(v) || 0
            }
            const res = await axios.post(backendUrl + '/api/stock/update', { productId, stock }, headers)
            if (res.data.success) {
                toast.success('Stock updated')
                setEditing(null)
                fetchStock()
            } else {
                toast.error(res.data.message)
            }
        } catch (_) { toast.error('Failed to update') }
        setSaving(false)
    }

    const stockTotal = (stock) => {
        if (!stock) return 0
        return Object.values(stock).reduce((s, v) => s + v, 0)
    }

    const isLow = (stock) => {
        if (!stock) return false
        return Object.values(stock).some(v => v <= LOW_THRESHOLD)
    }

    const displayed = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
        const matchFilter = filter === 'all' ? true : isLow(p.stock)
        return matchSearch && matchFilter
    })

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-semibold text-gray-800">Stock Management</h2>
                <button onClick={fetchStock} className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                    ↻ Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48"
                />
                <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                    {['all', 'low'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${filter === f ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {f === 'all' ? 'All Products' : '⚠️ Low Stock'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin w-7 h-7 border-4 border-gray-200 border-t-gray-700 rounded-full" />
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {displayed.length === 0 ? (
                        <p className="text-center text-gray-400 py-12 text-sm">No products found</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Sizes & Stock</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {displayed.map(product => (
                                    <tr key={product._id} className="hover:bg-gray-50 transition">

                                        {/* Product name */}
                                        <td className="px-4 py-3 font-medium text-gray-800 max-w-[160px]">
                                            <p className="truncate">{product.name}</p>
                                        </td>

                                        {/* Sizes & stock */}
                                        <td className="px-4 py-3">
                                            {editing === product._id ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.keys(draft).map(size => (
                                                        <div key={size} className="flex items-center gap-1">
                                                            <span className="text-xs text-gray-500 w-6 text-center font-medium">{size}</span>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                value={draft[size]}
                                                                onChange={e => setDraft({ ...draft, [size]: e.target.value })}
                                                                className="w-14 border border-gray-300 rounded px-1.5 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {product.stock && Object.entries(product.stock).map(([size, qty]) => (
                                                        <span
                                                            key={size}
                                                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${qty <= LOW_THRESHOLD ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}
                                                        >
                                                            {size}: {qty}
                                                        </span>
                                                    ))}
                                                    {(!product.stock || product.stock.size === 0) && (
                                                        <span className="text-xs text-gray-400">Not set</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        {/* Total */}
                                        <td className="px-4 py-3 font-semibold text-gray-800">
                                            {stockTotal(product.stock)}
                                        </td>

                                        {/* Status badge */}
                                        <td className="px-4 py-3">
                                            {isLow(product.stock) ? (
                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Low Stock</span>
                                            ) : stockTotal(product.stock) === 0 ? (
                                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Not Set</span>
                                            ) : (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">In Stock</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            {editing === product._id ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => saveStock(product._id)}
                                                        disabled={saving}
                                                        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                                    >
                                                        {saving ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditing(null)}
                                                        className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startEdit(product)}
                                                    className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                                                >
                                                    Edit Stock
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    )
}

export default Stock
