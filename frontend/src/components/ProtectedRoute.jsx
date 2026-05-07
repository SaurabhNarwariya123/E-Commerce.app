import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'

const ProtectedRoute = ({ element }) => {
  const { token, navigate } = useContext(ShopContext);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // If user is logged in, show the element
  if (token) {
    return element;
  }

  // If not logged in, return null (component will redirect via useEffect)
  return null;
}

export default ProtectedRoute
