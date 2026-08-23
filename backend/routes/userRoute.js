import express from 'express';
import { loginUser, registerUser, verifyEmailOtp, resendOtp, forgotPassword, resetPassword, adminLogin, googleAuth, logoutUser, getProfile, getAddresses, addAddress, updateAddress, deleteAddress, getWishlist, addToWishlist, removeFromWishlist, getAllCustomers } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const userRouter = express.Router();

userRouter.post('/register',        registerUser)
userRouter.post('/verify-email',    verifyEmailOtp)
userRouter.post('/resend-otp',      resendOtp)
userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/reset-password',  resetPassword)
userRouter.post('/login',    loginUser)
userRouter.post('/admin',    adminLogin)
userRouter.post('/google',   googleAuth)
userRouter.post('/logout',   logoutUser)
userRouter.get('/profile',    authUser, getProfile)
userRouter.post('/addresses', authUser, getAddresses)
userRouter.post('/addresses/add',    authUser, addAddress)
userRouter.post('/addresses/update', authUser, updateAddress)
userRouter.post('/addresses/delete', authUser, deleteAddress)
userRouter.post('/wishlist',        authUser, getWishlist)
userRouter.post('/wishlist/add',    authUser, addToWishlist)
userRouter.post('/wishlist/remove', authUser, removeFromWishlist)
userRouter.get('/admin/customers', adminAuth, getAllCustomers)

export default userRouter;
