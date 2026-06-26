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
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
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
  }, []);

  useEffect(() => {
    if (localStorage.getItem('userId')) {
      getUserCart();
    }
  }, []);

  const value = {
    products, currency,delivery_fee,search,
    setSearch,showSearch,setShowSearch,showCartSidebar,setShowCartSidebar,cartItems,
    addToCart,setCartItems,getCartCount,updateQuantity,getCartAmount,
    navigate,backendUrl,setToken,token,userId,setUserId,userName,setUserName,userEmail,setUserEmail,
  };

  return ( 
  <ShopContext.Provider value={value} >
   {props.children}
  </ShopContext.Provider>
  );

  }

export default ShopContextProvider;
