import bcrypt from "bcrypt"
import validator from "validator"
import userModel from '../models/userModel.js'
import orderModel from '../models/orderModel.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { sendRegistrationOTPEmail, sendPasswordResetOTPEmail } from '../config/email.js'

const normalizeEmail = (email) => email?.trim().toLowerCase()
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()
const REWARD_POINTS_TO_RUPEE_RATE = 1
const WELCOME_BONUS_POINTS = 50 // one-time reward for creating an account

const setCookieToken = (res, token) => {
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
      });
}

const findUserByEmail = async (email) => {
      const normalizedEmail = normalizeEmail(email)
      if (!normalizedEmail) return null

      const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return userModel.findOne({
            email: { $regex: `^${escapedEmail}$`, $options: 'i' }
      })
}

// ============= TOKEN CREATION FUNCTION =============
// Creates a JWT token with user ID and expiration
const createToken = (id) => {
      if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured in environment variables");
      }
      return jwt.sign(
            { id }, 
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
}

// ============= USER LOGIN =============
const loginUser = async(req, res) => {
      try {
            const { email, password } = req.body;
            const normalizedEmail = normalizeEmail(email)

            // Validate input
            if (!normalizedEmail || !password) {
                  return res.json({ success: false, message: "Email and password are required" });
            }

            // Find user
            const user = await findUserByEmail(normalizedEmail);
            if (!user) {
                  return res.json({ success: false, message: "User not found. Please sign up first." });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                  return res.json({ success: false, message: "Invalid credentials" });
            }

            // Block login until the email has been verified
            if (!user.isEmailVerified) {
                  return res.json({
                        success: false,
                        message: "Please verify your email before logging in",
                        code: 'EMAIL_NOT_VERIFIED'
                  });
            }

            // Create token and set as HttpOnly cookie
            const token = createToken(user._id);
            setCookieToken(res, token);
            res.json({ success: true, token, userId: user._id, name: user.name, email: user.email });

      } catch (error) {
            console.error("Login error:", error);
            res.json({ success: false, message: error.message });
      }
}

// ============= USER REGISTER =============
const registerUser = async (req, res) => {
      try {
            const { name, email, password } = req.body;
            const normalizedEmail = normalizeEmail(email)

            // Validate input
            if (!name || !normalizedEmail || !password) {
                  return res.json({ success: false, message: "All fields are required" });
            }

            // Check if user already exists
            const exists = await findUserByEmail(normalizedEmail);
            if (exists) {
                  return res.json({ success: false, message: "User already exists" });
            }

            // Validate email format
            if (!validator.isEmail(normalizedEmail)) {
                  return res.json({ success: false, message: "Please enter a valid email" });
            }

            // Validate password strength
            if (password.length < 8) {
                  return res.json({ success: false, message: "Please enter a strong password (min 8 characters)" });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const newUser = new userModel({
                  name,
                  email: normalizedEmail,
                  password: hashedPassword
            });

            // Generate email-verification OTP (user stays unverified/logged-out until confirmed)
            const otp = generateOTP()
            newUser.emailOtp = otp
            newUser.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000)

            const user = await newUser.save();

            try {
                  await sendRegistrationOTPEmail(user.email, otp)
            } catch (emailError) {
                  // The address looked valid but the mail server rejected it outright —
                  // don't leave a stuck unverified account behind, and don't report success.
                  await userModel.findByIdAndDelete(user._id)
                  console.error("Failed to send registration OTP:", emailError)
                  return res.json({ success: false, message: "We couldn't send the OTP to that email address. Please check it and try again." });
            }

            res.json({ success: true, message: "OTP sent to your email. Please verify to continue.", email: user.email });

      } catch (error) {
            console.error("Register error:", error);
            res.json({ success: false, message: error.message });
      }
}

// ============= VERIFY EMAIL OTP (completes registration, logs the user in) =============
const verifyEmailOtp = async (req, res) => {
      try {
            const { email, otp } = req.body;
            const normalizedEmail = normalizeEmail(email)
            const user = await findUserByEmail(normalizedEmail);
            if (!user) return res.json({ success: false, message: "User not found" });

            if (user.isEmailVerified) {
                  return res.json({ success: false, message: "Email already verified. Please login." });
            }
            if (!user.emailOtp || !user.emailOtpExpiry) {
                  return res.json({ success: false, message: "No OTP found. Please request a new one." });
            }
            if (new Date() > user.emailOtpExpiry) {
                  return res.json({ success: false, message: "OTP has expired. Please request a new one." });
            }
            if (user.emailOtp !== otp) {
                  return res.json({ success: false, message: "Invalid OTP" });
            }

            user.isEmailVerified = true
            user.emailOtp = null
            user.emailOtpExpiry = null
            user.rewardPoints = (user.rewardPoints || 0) + WELCOME_BONUS_POINTS
            await user.save()

            const token = createToken(user._id);
            setCookieToken(res, token);
            res.json({ success: true, token, message: "Email verified successfully!", userId: user._id, name: user.name, email: user.email });

      } catch (error) {
            console.error("Verify email OTP error:", error);
            res.json({ success: false, message: error.message });
      }
}

// ============= RESEND OTP (registration verification) =============
const resendOtp = async (req, res) => {
      try {
            const { email } = req.body;
            const normalizedEmail = normalizeEmail(email)
            const user = await findUserByEmail(normalizedEmail);
            if (!user) return res.json({ success: false, message: "User not found" });
            if (user.isEmailVerified) {
                  return res.json({ success: false, message: "Email already verified. Please login." });
            }

            const otp = generateOTP()
            user.emailOtp = otp
            user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000)
            await user.save()

            await sendRegistrationOTPEmail(user.email, otp)
            res.json({ success: true, message: "A new OTP has been sent to your email" });

      } catch (error) {
            console.error("Resend OTP error:", error);
            res.json({ success: false, message: error.message });
      }
}

// ============= FORGOT PASSWORD (request OTP) =============
const forgotPassword = async (req, res) => {
      try {
            const { email } = req.body;
            const normalizedEmail = normalizeEmail(email)
            const user = await findUserByEmail(normalizedEmail);

            // Don't reveal whether the account exists
            if (user) {
                  const otp = generateOTP()
                  user.resetOtp = otp
                  user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000)
                  await user.save()
                  await sendPasswordResetOTPEmail(user.email, otp)
            }

            res.json({ success: true, message: "If an account with that email exists, a password reset OTP has been sent" });

      } catch (error) {
            console.error("Forgot password error:", error);
            res.json({ success: false, message: error.message });
      }
}

// ============= RESET PASSWORD (with OTP) =============
const resetPassword = async (req, res) => {
      try {
            const { email, otp, newPassword } = req.body;
            const normalizedEmail = normalizeEmail(email)

            if (!newPassword || newPassword.length < 8) {
                  return res.json({ success: false, message: "Please enter a strong password (min 8 characters)" });
            }

            const user = await findUserByEmail(normalizedEmail);
            if (!user) return res.json({ success: false, message: "User not found" });
            if (!user.resetOtp || !user.resetOtpExpiry) {
                  return res.json({ success: false, message: "No OTP found. Please request a new one." });
            }
            if (new Date() > user.resetOtpExpiry) {
                  return res.json({ success: false, message: "OTP has expired. Please request a new one." });
            }
            if (user.resetOtp !== otp) {
                  return res.json({ success: false, message: "Invalid OTP" });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            user.resetOtp = null
            user.resetOtpExpiry = null
            await user.save()

            res.json({ success: true, message: "Password reset successfully. You can now login." });

      } catch (error) {
            console.error("Reset password error:", error);
            res.json({ success: false, message: error.message });
      }
}

// ============= ADMIN LOGIN =============
const adminLogin = async (req, res) => {
      try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                  return res.json({ success: false, message: "Email and password are required" });
            }

            // Check admin credentials
            if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                  // Create token using the same createToken function
                  const token = createToken(email);
                  return res.json({ success: true, token });
            }

            res.json({ success: false, message: "Invalid credentials" });

      } catch (error) {
            console.error("Admin login error:", error);
            res.json({ success: false, message: error.message });
      }
}

// export { loginUser, registerUser, adminLogin}

// ============= GOOGLE AUTH (SIGN IN / REGISTER) =============
const googleAuth = async (req, res) => {
      try {
            const { name, email } = req.body;
            const normalizedEmail = normalizeEmail(email)

            if (!normalizedEmail || !name) {
                  return res.json({ success: false, message: "Name and email are required" });
            }

            let user = await findUserByEmail(normalizedEmail);

            if (!user) {
                  const salt = await bcrypt.genSalt(10)
                  const randomPassword = crypto.randomBytes(32).toString('hex')
                  const hashedPassword = await bcrypt.hash(randomPassword, salt)

                  user = await userModel.create({
                        name,
                        email: normalizedEmail,
                        password: hashedPassword,
                        isEmailVerified: true, // Google already verified this email
                        rewardPoints: WELCOME_BONUS_POINTS
                  })
            }

            const token = createToken(user._id);
            setCookieToken(res, token);
            return res.json({ success: true, token, userId: user._id, name: user.name, email: user.email });

      } catch (error) {
            console.error("Google auth error:", error);
            return res.json({ success: false, message: error.message });
      }
}

// ============= GET PROFILE =============
const getProfile = async (req, res) => {
    try {
        // req.user.id is set by authUser middleware (works for GET — no body needed)
        const userId = req.user?.id || req.body?.userId
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })
        const user = await userModel.findById(userId).select('name email isEmailVerified rewardPoints')
        if (!user) return res.json({ success: false, message: 'User not found' })
        res.json({
            success: true,
            name: user.name,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            rewardPoints: user.rewardPoints,
            rewardValueInRupees: Math.round(user.rewardPoints * REWARD_POINTS_TO_RUPEE_RATE * 100) / 100
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Get saved addresses ──────────────────────────────────────────────────────
const getAddresses = async (req, res) => {
    try {
        const userId = req.user?.id || req.body?.userId
        if (!userId) return res.json({ success: false, message: 'Unauthorized' })
        const user = await userModel.findById(userId).select('addresses')
        if (!user) return res.json({ success: false, message: 'User not found' })
        res.json({ success: true, addresses: user.addresses || [] })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Add a new address ────────────────────────────────────────────────────────
const addAddress = async (req, res) => {
    try {
        const userId = req.user?.id || req.body?.userId
        if (!userId) return res.json({ success: false, message: 'Unauthorized' })
        const { address } = req.body
        if (!address?.street || !address?.city) {
            return res.json({ success: false, message: 'Street and city are required' })
        }
        const user = await userModel.findByIdAndUpdate(
            userId,
            { $push: { addresses: address } },
            { new: true }
        ).select('addresses')
        if (!user) return res.json({ success: false, message: 'User not found' })
        res.json({ success: true, addresses: user.addresses || [] })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Update an existing address ──────────────────────────────────────────────
const updateAddress = async (req, res) => {
    try {
        const userId = req.user?.id || req.body?.userId
        if (!userId) return res.json({ success: false, message: 'Unauthorized' })
        const { addressId, address } = req.body
        if (!address?.street || !address?.city) {
            return res.json({ success: false, message: 'Street and city are required' })
        }
        const user = await userModel.findOneAndUpdate(
            { _id: userId, 'addresses._id': addressId },
            {
                $set: {
                    'addresses.$.label':     address.label     || 'Home',
                    'addresses.$.firstName': address.firstName || '',
                    'addresses.$.lastName':  address.lastName  || '',
                    'addresses.$.street':    address.street,
                    'addresses.$.city':      address.city,
                    'addresses.$.state':     address.state     || '',
                    'addresses.$.zipcode':   address.zipcode   || '',
                    'addresses.$.country':   address.country   || '',
                    'addresses.$.phone':     address.phone     || '',
                    'addresses.$.lat':       address.lat       ?? null,
                    'addresses.$.lng':       address.lng       ?? null,
                }
            },
            { new: true }
        ).select('addresses')
        if (!user) return res.json({ success: false, message: 'Address not found' })
        res.json({ success: true, addresses: user.addresses || [] })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Delete an address ────────────────────────────────────────────────────────
const deleteAddress = async (req, res) => {
    try {
        const userId = req.user?.id || req.body?.userId
        if (!userId) return res.json({ success: false, message: 'Unauthorized' })
        const { addressId } = req.body
        const user = await userModel.findByIdAndUpdate(
            userId,
            { $pull: { addresses: { _id: addressId } } },
            { new: true }
        ).select('addresses')
        if (!user) return res.json({ success: false, message: 'User not found' })
        res.json({ success: true, addresses: user.addresses || [] })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Get wishlist ──────────────────────────────────────────────────────────────
const getWishlist = async (req, res) => {
    try {
        const userId = req.user?.id || req.body?.userId
        if (!userId) return res.json({ success: false, message: 'Unauthorized' })
        const user = await userModel.findById(userId).select('wishlist')
        if (!user) return res.json({ success: false, message: 'User not found' })
        res.json({ success: true, wishlist: user.wishlist || [] })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Add a product to wishlist ────────────────────────────────────────────────
const addToWishlist = async (req, res) => {
    try {
        const userId = req.user?.id || req.body?.userId
        if (!userId) return res.json({ success: false, message: 'Unauthorized' })
        const { productId } = req.body
        if (!productId) return res.json({ success: false, message: 'Product ID is required' })
        const user = await userModel.findByIdAndUpdate(
            userId,
            { $addToSet: { wishlist: productId } },
            { new: true }
        ).select('wishlist')
        if (!user) return res.json({ success: false, message: 'User not found' })
        res.json({ success: true, wishlist: user.wishlist || [] })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Remove a product from wishlist ───────────────────────────────────────────
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user?.id || req.body?.userId
        if (!userId) return res.json({ success: false, message: 'Unauthorized' })
        const { productId } = req.body
        if (!productId) return res.json({ success: false, message: 'Product ID is required' })
        const user = await userModel.findByIdAndUpdate(
            userId,
            { $pull: { wishlist: productId } },
            { new: true }
        ).select('wishlist')
        if (!user) return res.json({ success: false, message: 'User not found' })
        res.json({ success: true, wishlist: user.wishlist || [] })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ============= ADMIN: LIST CUSTOMERS (with order stats) =============
const getAllCustomers = async (req, res) => {
    try {
        const users = await userModel.find({}, 'name email rewardPoints isEmailVerified createdAt').sort({ createdAt: -1 })

        const orderStats = await orderModel.aggregate([
            { $group: { _id: '$userId', orderCount: { $sum: 1 }, totalSpent: { $sum: '$amount' }, lastOrderDate: { $max: '$date' } } }
        ])
        const statsByUserId = Object.fromEntries(orderStats.map(s => [s._id, s]))

        const customers = users.map(u => {
            const stats = statsByUserId[u._id.toString()]
            return {
                _id: u._id,
                name: u.name,
                email: u.email,
                rewardPoints: u.rewardPoints,
                isEmailVerified: u.isEmailVerified,
                joinedAt: u.createdAt || null,
                orderCount: stats?.orderCount || 0,
                totalSpent: stats?.totalSpent || 0,
                lastOrderDate: stats?.lastOrderDate || null,
            }
        })

        res.json({ success: true, customers })
    } catch (error) {
        console.error('getAllCustomers error:', error)
        res.json({ success: false, message: error.message })
    }
}

// ============= LOGOUT =============
const logoutUser = (req, res) => {
      const isProduction = process.env.NODE_ENV === 'production';
      res.clearCookie('token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
      });
      res.json({ success: true, message: 'Logged out successfully' });
}

export { loginUser, registerUser, verifyEmailOtp, resendOtp, forgotPassword, resetPassword, adminLogin, googleAuth, logoutUser, getProfile, getAddresses, addAddress, updateAddress, deleteAddress, getWishlist, addToWishlist, removeFromWishlist, getAllCustomers }