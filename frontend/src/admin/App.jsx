import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import ProductView from "./pages/ProductView";
import Orders from "./pages/Orders";
import OrderView from "./pages/OrderView";
import DeliveryPersons from "./pages/DeliveryPersons";
import Offers from "./pages/Offers";
import Coupons from "./pages/Coupons";
import Reports from "./pages/Reports";
import Customers from "./pages/Customers";
import CustomerView from "./pages/CustomerView";
import CouponView from "./pages/CouponView";
import OfferView from "./pages/OfferView";
import DeliveryPersonView from "./pages/DeliveryPersonView";
import Dashboard from "./pages/Dashboard";
import Stock from "./pages/Stock";
import Login from "./components/Login";
import { ToastContainer } from 'react-toastify';

export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
export const currency = '$';

const AdminApp = () => {
    const [token, setToken] = useState(localStorage.getItem('admin_token') || '');

    useEffect(() => {
        localStorage.setItem('admin_token', token)
    }, [token])

    return (
        <div className="admin-app bg-[#F5F7F6] h-screen flex flex-col overflow-hidden">
            <ToastContainer />
            {token === ""
                ? <Login setToken={setToken} />
                : <>
                    <div className="shrink-0">
                        <Navbar setToken={setToken} token={token} />
                        <hr className="border-gray-200" />
                    </div>
                    <div className="flex flex-1 min-h-0">
                        <Sidebar />
                        <div className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 lg:px-10 py-8 text-gray-600 text-base">
                            <Routes>
                                <Route index                    element={<Dashboard token={token} />} />
                                <Route path="dashboard"         element={<Dashboard token={token} />} />
                                <Route path="add"               element={<Add token={token} />} />
                                <Route path="list"              element={<List token={token} />} />
                                <Route path="product/:id"       element={<ProductView token={token} />} />
                                <Route path="orders"            element={<Orders token={token} />} />
                                <Route path="order/:id"         element={<OrderView token={token} />} />
                                <Route path="stock"             element={<Stock token={token} />} />
                                <Route path="delivery-persons"  element={<DeliveryPersons token={token} />} />
                                <Route path="delivery-person/:id" element={<DeliveryPersonView token={token} />} />
                                <Route path="offers"            element={<Offers token={token} />} />
                                <Route path="offer/:id"         element={<OfferView token={token} />} />
                                <Route path="coupons"           element={<Coupons token={token} />} />
                                <Route path="coupon/:id"        element={<CouponView token={token} />} />
                                <Route path="reports"           element={<Reports token={token} />} />
                                <Route path="customers"         element={<Customers token={token} />} />
                                <Route path="customer/:id"      element={<CustomerView token={token} />} />
                            </Routes>
                        </div>
                    </div>
                </>
            }
        </div>
    );
};

export default AdminApp;
