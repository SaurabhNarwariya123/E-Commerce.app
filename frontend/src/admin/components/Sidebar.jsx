import React from 'react'
import { NavLink } from 'react-router-dom'

const svg = (children) => (
    <svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>{children}</svg>
)

const ICONS = {
    dashboard: svg(<><rect x='3' y='3' width='7' height='9' rx='1.5' /><rect x='14' y='3' width='7' height='5' rx='1.5' /><rect x='14' y='12' width='7' height='9' rx='1.5' /><rect x='3' y='16' width='7' height='5' rx='1.5' /></>),
    products: svg(<><path d='M21 8l-9-5-9 5 9 5 9-5z' /><path d='M3 8v8l9 5 9-5V8' /><path d='M12 13v8' /></>),
    stock: svg(<><path d='M4 20V10' /><path d='M10 20V4' /><path d='M16 20v-7' /><path d='M22 20H2' /></>),
    orders: svg(<><path d='M9 4h6a1 1 0 011 1v1H8V5a1 1 0 011-1z' /><path d='M8 6H6a1 1 0 00-1 1v13a1 1 0 001 1h12a1 1 0 001-1V7a1 1 0 00-1-1h-2' /><path d='M9 12h6M9 16h4' /></>),
    customers: svg(<><circle cx='9' cy='8' r='3.2' /><path d='M3 20a6 6 0 0112 0' /><circle cx='17' cy='9' r='2.4' /><path d='M16 14.2A5 5 0 0121 20' /></>),
    delivery: svg(<><circle cx='6' cy='17' r='3' /><circle cx='18' cy='17' r='3' /><path d='M6 17l4-8h5l3 8' /><path d='M9 6h3' /></>),
    offers: svg(<path d='M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.7l5.4-.8L12 3z' />),
    coupons: svg(<><path d='M3 9a2 2 0 002-2h14a2 2 0 002 2v1.5a1.5 1.5 0 000 3V15a2 2 0 00-2 2H5a2 2 0 00-2-2v-1.5a1.5 1.5 0 000-3V9z' /><path d='M13 7v10' strokeDasharray='2 2' /></>),
    reports: svg(<><path d='M3 17l5-5 4 4 8-9' /><path d='M15 7h5v5' /></>),
    assistant: svg(<><rect x='4' y='8' width='16' height='11' rx='3' /><path d='M12 4v4' /><circle cx='9' cy='13.5' r='1' /><circle cx='15' cy='13.5' r='1' /></>),
}

const NAV_GROUPS = [
    { title: 'Overview', items: [
        { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { to: '/admin/reports',   icon: 'reports',   label: 'Reports' },
    ]},
    { title: 'Store', items: [
        { to: '/admin/list',      icon: 'products',  label: 'Products' },
        { to: '/admin/stock',     icon: 'stock',     label: 'Stock' },
        { to: '/admin/orders',    icon: 'orders',    label: 'Orders' },
        { to: '/admin/customers', icon: 'customers', label: 'Customers' },
    ]},
    { title: 'Growth', items: [
        { to: '/admin/offers',    icon: 'offers',    label: 'Festival Offers' },
        { to: '/admin/coupons',   icon: 'coupons',   label: 'Coupons' },
    ]},
    { title: 'Operations', items: [
        { to: '/admin/delivery-persons', icon: 'delivery',  label: 'Delivery Partners' },
        { to: '/admin/assistant',        icon: 'assistant', label: 'AI Assistant' },
    ]},
]

const NavItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        title={label}
        className={({ isActive }) =>
            `relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
                isActive
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            }`
        }
    >
        {({ isActive }) => (
            <>
                {isActive && <span className='absolute -left-3 top-1.5 bottom-1.5 w-[3px] rounded-r bg-emerald-400' />}
                <span className='shrink-0'>{ICONS[icon]}</span>
                <span className='hidden md:block truncate'>{label}</span>
            </>
        )}
    </NavLink>
)

const Sidebar = () => (
    <aside className='w-[196px] max-md:w-14 shrink-0 h-full overflow-y-auto adm-scroll bg-[var(--adm-side)]'>
        <nav className='flex flex-col gap-4 py-4 px-3'>
            {NAV_GROUPS.map(group => (
                <div key={group.title} className='flex flex-col gap-0.5'>
                    <p className='hidden md:block px-2.5 mb-1 text-xs uppercase tracking-[0.12em] text-slate-500 font-semibold'>{group.title}</p>
                    {group.items.map(item => <NavItem key={item.to} {...item} />)}
                </div>
            ))}
        </nav>
    </aside>
)

export default Sidebar
