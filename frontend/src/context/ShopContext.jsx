import react, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

// Send cookies with every request
axios.defaults.withCredentials = true;

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const freeDeliveryThreshold = 350;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('userId') ? 'logged_in' : '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const navigate = useNavigate();

  // Cookie handles auth — no headers needed
  const getAuthHeaders = () => ({});

  // Handle authentication errors
  const handleAuthError = (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    const errorCode = error.response?.data?.code;

    if (errorCode === 'TOKEN_EXPIRED' || errorMessage?.includes('expired')) {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      setToken('');
      setUserId('');
      toast.error('Session expired. Please login again');
      navigate('/login');
    } else if (errorCode === 'INVALID_TOKEN' || errorMessage?.includes('invalid') || errorMessage?.includes('authorized') || errorMessage?.includes('No token')) {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      setToken('');
      setUserId('');
      toast.error('Please login to continue');
      navigate('/login');
    }
  };

//   //   -------------------------------------add TO cart-------------------

  const addToCart = async (itemId, size) => {
   let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    setCartItems(cartData);
    setShowCartSidebar(true);

    if (token) {
      try { 
        await axios.post(backendUrl + "/api/cart/add", { itemId, size }, {
          headers: getAuthHeaders()
        });
      } catch (error) {
        console.log(error);
        handleAuthError(error);
        toast.error(error.response?.data?.message || error.message);
      }
    }
  }


//   //  -------------------- get cart  count   -------------------------
  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {}
      }
    }

    return totalCount;
  };

//   //      -----------------------updated quantity -----------------------------------

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(backendUrl + "/api/cart/update", { itemId, size, quantity }, {
          headers: getAuthHeaders()
        });
      } catch (error) {
        console.log(error);
        handleAuthError(error);
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

//   //    ------------------------------ get cart amount -----------------------------------
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) 
        {

        }
      }
    }

    return totalAmount;
  };

  // 0 delivery fee once the cart amount reaches the free-delivery threshold
  const getDeliveryFee = () => {
    const amount = getCartAmount();
    if (amount === 0) return 0;
    return amount >= freeDeliveryThreshold ? 0 : delivery_fee;
  };

  const getProductData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  const getActiveCoupons = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/coupon/active');
      if (response.data.success) setActiveCoupons(response.data.coupons || []);
    } catch (error) {
      console.log(error);
    }
  }

  // Best coupon-driven price for a given item price, for the "Offer Price" preview
  // shown on product cards (mirrors the server-side calc in couponController).
  const getBestOffer = (price) => {
    let best = null
    for (const c of activeCoupons) {
      if (price < c.minOrderAmount) continue
      let discount = c.discountType === 'percent' ? (price * c.discountValue) / 100 : c.discountValue
      if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount)
      discount = Math.min(Math.round(discount), price)
      if (discount <= 0) continue
      if (!best || discount > best.discount) best = { code: c.code, discount, offerPrice: price - discount }
    }
    return best
  }

  //   //  -------------------- wishlist  -------------------------
  const getWishlist = async () => {
    try {
      const response = await axios.post(backendUrl + '/api/user/wishlist', {});
      if (response.data.success) setWishlist(response.data.wishlist || []);
    } catch (error) {
      console.log(error);
    }
  }

  const toggleWishlist = async (productId) => {
    if (!token) {
      toast.error('Please login to use your wishlist');
      navigate('/login');
      return;
    }

    const isWished = wishlist.includes(productId);
    setWishlist(prev => isWished ? prev.filter(id => id !== productId) : [...prev, productId]);

    try {
      const url = backendUrl + (isWished ? '/api/user/wishlist/remove' : '/api/user/wishlist/add');
      const response = await axios.post(url, { productId });
      if (response.data.success) {
        setWishlist(response.data.wishlist || []);
        toast.success(isWished ? 'Removed from wishlist' : 'Added to wishlist');
      }
    } catch (error) {
      console.log(error);
      handleAuthError(error);
      toast.error(error.response?.data?.message || error.message);
    }
  }

  const getUserCart = async () => {
    try {
      const response = await axios.post(
        backendUrl + '/api/cart/get',
        {}
      );

      if (response.data.success) {
        setCartItems(response.data.cartData);
      } else {
        handleAuthError({ response: { data: response.data } });
      }
    } catch (error) {
      console.log(error);
      handleAuthError(error);
    }
  }
    


  useEffect(() => {
    getProductData();
    getActiveCoupons();
  }, []);

  useEffect(() => {
    if (localStorage.getItem('userId')) {
      getUserCart();
      getWishlist();
    }
  }, []);

  const value = {
    products, currency,delivery_fee,freeDeliveryThreshold,search,
    setSearch,showSearch,setShowSearch,showCartSidebar,setShowCartSidebar,cartItems,
    addToCart,setCartItems,getCartCount,updateQuantity,getCartAmount,getDeliveryFee,
    navigate,backendUrl,setToken,token,userId,setUserId,userName,setUserName,userEmail,setUserEmail,
    wishlist,toggleWishlist,
    activeCoupons,getBestOffer,
  };

  return ( 
  <ShopContext.Provider value={value} >
   {props.children}
  </ShopContext.Provider>
  );

  }

export default ShopContextProvider;
