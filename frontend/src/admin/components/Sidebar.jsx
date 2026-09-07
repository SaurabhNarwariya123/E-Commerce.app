import React from 'react'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
    { to: '/admin/dashboard',        icon: '🏠', label: 'Dashboard' },
    { to: '/admin/list',             icon: '🛍️', label: 'Products' },
    { to: '/admin/stock',            icon: '📊', label: 'Stock' },
    { to: '/admin/orders',           icon: '📋', label: 'Orders' },
    { to: '/admin/customers',        icon: '👥', label: 'Customers' },
    { to: '/admin/delivery-persons', icon: '🚲', label: 'Delivery Partners' },
    { to: '/admin/offers',           icon: '🎉', label: 'Festival Offers' },
    { to: '/admin/coupons',          icon: '🏷️', label: 'Coupons' },
    { to: '/admin/reports',          icon: '📈', label: 'Reports' },
]

const NavItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                isActive ? 'bg-green-700 text-white shadow-sm' : 'text-gray-600 hover:bg-green-50'
            }`
        }
    >
        <span className='text-base w-5 text-center shrink-0'>{icon}</span>
        <span className='hidden md:block truncate'>{label}</span>
    </NavLink>
)

const Sidebar = () => {
    return (
        <div className='w-[18%] min-w-16 shrink-0 h-full border-r border-gray-200 bg-white overflow-y-auto'>
            <div className='flex flex-col gap-1 py-6 px-3'>

                {NAV_ITEMS.map(item => <NavItem key={item.to} {...item} />)}

            </div>
        </div>
    )
}

export default Sidebar
