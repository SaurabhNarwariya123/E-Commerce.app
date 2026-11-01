import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { backendUrl, currency } from '../App'
import Pagination, { usePagination } from '../components/Pagination'
import { EyeIcon, IconButton } from '../components/Icons'

const initials = (name) => name ? name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'

const AVATAR_COLORS = ['bg-emerald-600', 'bg-blue-600', 'bg-purple-600', 'bg-orange-500', 'bg-pink-600', 'bg-emerald-600']
const avatarColor = (id) => AVATAR_COLORS[[...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]

const Customers = ({ token }) => {
    const navigate = useNavigate()
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('joined') // joined | spent | orders

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(backendUrl + '/api/user/admin/customers', { headers: { token } })
                if (res.data.success) setCustomers(res.data.customers)
            } catch (_) {}
            setLoading(false)
        }
        fetch()
    }, [token])

    const filtered = customers
        .filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'spent') return b.totalSpent - a.totalSpent
            if (sortBy === 'orders') return b.orderCount - a.orderCount
            return new Date(b.joinedAt || 0) - new Date(a.joinedAt || 0)
        })

    const { page, setPage, totalPages, pageItems, start } = usePagination(filtered, 10)

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full" />
        </div>
    )

    return (
        <div className="space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-[var(--adm-ink)]">Customers</h1>
                    <p className="text-xs text-[var(--adm-muted)] mt-0.5">{customers.length} registered customer{customers.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 w-48"
                    />
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm cursor-pointer">
                        <option value="joined">Newest First</option>
                        <option value="spent">Top Spenders</option>
                        <option value="orders">Most Orders</option>
                    </select>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {filtered.length === 0 ? (
                    <p className="text-center text-[var(--adm-muted)] py-12 text-sm">No customers found</p>
                ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide">Customer</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide">Orders</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide">Total Spent</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide">Reward Points</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide">Joined</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide">Status</th>
                                <th className="px-3 py-2.5 text-right text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pageItems.map(c => (
                                <tr key={c._id} className="hover:bg-gray-50 transition">
                                    <td className="px-3 py-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full ${avatarColor(c._id)} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                                                {initials(c.name)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-[var(--adm-ink)] truncate">{c.name}</p>
                                                <p className="text-xs text-[var(--adm-muted)] truncate">{c.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2.5 text-[var(--adm-ink)]">{c.orderCount}</td>
                                    <td className="px-3 py-2.5 font-semibold text-[var(--adm-ink)]">{currency}{c.totalSpent.toFixed(2)}</td>
                                    <td className="px-3 py-2.5 text-[var(--adm-ink)]">{c.rewardPoints} pts</td>
                                    <td className="px-3 py-2.5 text-xs text-[var(--adm-muted)]">
                                        {c.joinedAt ? new Date(c.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isEmailVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-700'}`}>
                                            {c.isEmailVerified ? 'Verified' : 'Unverified'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <div className="flex items-center justify-end">
                                            <IconButton variant="view" onClick={() => navigate(`/admin/customer/${c._id}`)} aria-label="View customer" title="View">
                                                <EyeIcon />
                                            </IconButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                )}
                <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={10} start={start} />
            </div>
        </div>
    )
}

export default Customers
