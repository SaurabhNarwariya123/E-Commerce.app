import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ShopContext } from './context/ShopContext'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Order from './pages/Orders'
import OrderTracking from './pages/OrderTracking'
import Navbar from './components/Navbar'
import Collection from './pages/Collection'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
// import AIChat from './components/AIChat'
import CartSidebar from './components/CartSidebar'
import { ToastContainer, toast } from 'react-toastify'; 
import Verify from './pages/Verify'
import AdminApp from './admin/App'
import ProtectedRoute from './components/ProtectedRoute'
import DeliveryPortal from './pages/DeliveryPortal'
import Profile from './pages/Profile'

const App = () => {
  // const [showAIChat, setShowAIChat] = useState(false);
  // const { userId, token, userName, userEmail } = useContext(ShopContext); // used by AI Chat

  return (
    <Routes>
      <Route path='/admin/*' element={<AdminApp/>}/>
      <Route path='/delivery' element={<DeliveryPortal/>}/>
      <Route path='/*' element={
        <div className = 'px-4 sm:px-[5vw] md:px[7vw] lg:px-[9vw]'>
          <ToastContainer/>
           <CartSidebar/>
           <Navbar/>
           <SearchBar/>

          
           <Routes>
             <Route path='/' element = {<Home/>}/>
             <Route path='/collection' element = {<Collection/>}/>
             <Route path='/about' element = {<About/>}/>
             <Route path='/contact' element = {<Contact/>}/>
             <Route path='/product/:productId' element = {<Product/>}/>
             <Route path='/cart' element = {<Cart/>}/>
             <Route path='/login' element = {<Login/>}/>
             <Route path='/place-order' element = {<ProtectedRoute element={<PlaceOrder/>}/>}/>
             <Route path='/orders' element = {<Order/>}/>
             <Route path='/orders/:orderId' element = {<OrderTracking/>}/>
             <Route path='/profile' element = {<ProtectedRoute element={<Profile/>}/>}/>
             <Route path='/verify' element = {<Verify/>}/>
            </Routes>  
            <Footer/>

            {/* AI Chat - Commented Out
            {token && (
              <>
                <button
                  onClick={() => setShowAIChat(!showAIChat)}
                  className="fixed bottom-4 right-4 sm:bottom-6 md:bottom-8 sm:right-6 md:right-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 active:from-purple-800 active:to-blue-800 text-white rounded-full w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 z-40 text-lg sm:text-xl md:text-2xl hover:scale-110 active:scale-95 touch-manipulation"
                  title="AI Assistant"
                >
                  🤖
                </button>

                {showAIChat && (
                  <div className="fixed bottom-16 right-4 sm:bottom-20 md:bottom-24 md:right-6 lg:right-8 w-[90%] xs:w-[80%] sm:w-[70%] md:w-[60%] lg:w-[50%] xl:w-[40%] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-40 overflow-hidden" style={{ height: '70vh', maxHeight: '480px', minHeight: '350px' }}>
                    <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
                      <AIChat userId={userId} userName={userName} userEmail={userEmail} onClose={() => setShowAIChat(false)} />
                    </div>
                  </div>
                )}
              </>
            )}
            */}      
          </div>
      }/>
    </Routes>
  )
}

export default App
