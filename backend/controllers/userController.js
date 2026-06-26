import bcrypt from "bcrypt"
import validator from "validator"
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const normalizeEmail = (email) => email?.trim().toLowerCase()

const setCookieToken = (res, token) => {
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
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

            // Create token and set as HttpOnly cookie
            const token = createToken(user._id);
            setCookieToken(res, token);
            res.json({ success: true, userId: user._id, name: user.name, email: user.email });

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

            const user = await newUser.save();
            const token = createToken(user._id);
            setCookieToken(res, token);
            res.json({ success: true, userId: user._id, name: user.name, email: user.email });

      } catch (error) {
            console.error("Register error:", error);
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
                        password: hashedPassword
                  })
            }

            const token = createToken(user._id);
            setCookieToken(res, token);
            return res.json({ success: true, userId: user._id, name: user.name, email: user.email });

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
        const user = await userModel.findById(userId).select('name email')
        if (!user) return res.json({ success: false, message: 'User not found' })
        res.json({ success: true, name: user.name, email: user.email })
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

// ============= LOGOUT =============
const logoutUser = (req, res) => {
      const isProduction = process.env.NODE_ENV === 'production';
      res.clearCookie('token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
      });
      res.json({ success: true, message: 'Logged out successfully' });
}

export { loginUser, registerUser, adminLogin, googleAuth, logoutUser, getProfile, getAddresses, addAddress, updateAddress, deleteAddress }