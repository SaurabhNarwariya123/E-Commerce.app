import express from 'express';
import { loginUser, registerUser, adminLogin, googleAuth, logoutUser, getProfile, getAddresses, addAddress, updateAddress, deleteAddress } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login',    loginUser)
userRouter.post('/admin',    adminLogin)
userRouter.post('/google',   googleAuth)
userRouter.post('/logout',   logoutUser)
userRouter.get('/profile',    authUser, getProfile)
userRouter.post('/addresses', authUser, getAddresses)
userRouter.post('/addresses/add',    authUser, addAddress)
userRouter.post('/addresses/update', authUser, updateAddress)
userRouter.post('/addresses/delete', authUser, deleteAddress)

export default userRouter;
