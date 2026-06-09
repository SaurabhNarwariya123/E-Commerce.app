import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
    const link = "flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
    const active = { background: '#f3f4f6' }

    return (
        <div className='w-[18%] min-h-screen border-r-2'>
            <div className='flex flex-col gap-3 pt-6 pl-5 text-[14px]'>

                <NavLink className={link} style={({ isActive }) => isActive ? active : {}} to="/admin/dashboard">
                    <img className='w-5 h-5' src={assets.order_icon} alt="" />
                    <p className='hidden md:block'>Dashboard</p>
                </NavLink>

                <NavLink className={link} style={({ isActive }) => isActive ? active : {}} to="/admin/add">
                    <img className='w-5 h-5' src={assets.add_icon} alt="" />
                    <p className='hidden md:block'>Add Items</p>
                </NavLink>

                <NavLink className={link} style={({ isActive }) => isActive ? active : {}} to='/admin/list'>
                    <img className='w-5 h-5' src={assets.order_icon} alt="" />
                    <p className='hidden md:block'>Products</p>
                </NavLink>

                <NavLink className={link} style={({ isActive }) => isActive ? active : {}} to='/admin/stock'>
                    <img className='w-5 h-5' src={assets.parcel_icon} alt="" />
                    <p className='hidden md:block'>Stock</p>
                </NavLink>

                <NavLink className={link} style={({ isActive }) => isActive ? active : {}} to='/admin/orders'>
                    <img className='w-5 h-5' src={assets.order_icon} alt="" />
                    <p className='hidden md:block'>Orders</p>
                </NavLink>

                <NavLink className={link} style={({ isActive }) => isActive ? active : {}} to='/admin/delivery-persons'>
                    <img className='w-5 h-5' src={assets.parcel_icon} alt="" />
                    <p className='hidden md:block'>Delivery Partners</p>
                </NavLink>

            </div>
        </div>
    )
}

export default Sidebar
