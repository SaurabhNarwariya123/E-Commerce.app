import bcrypt from "bcrypt"
import validator from "validator"
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'

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

            // Validate input
            if (!email || !password) {
                  return res.json({ success: false, message: "Email and password are required" });
            }

            // Find user
            const user = await userModel.findOne({ email });
            if (!user) {
                  return res.json({ success: false, message: "User doesn't exist" });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                  return res.json({ success: false, message: "Invalid credentials" });
            }

            // Create token
            const token = createToken(user._id);
            res.json({ success: true, token });

      } catch (error) {
            console.error("Login error:", error);
            res.json({ success: false, message: error.message });
      }
}

// ============= USER REGISTER =============
const registerUser = async (req, res) => {
      try {
            const { name, email, password } = req.body;

            // Validate input
            if (!name || !email || !password) {
                  return res.json({ success: false, message: "All fields are required" });
            }

            // Check if user already exists
            const exists = await userModel.findOne({ email });
            if (exists) {
                  return res.json({ success: false, message: "User already exists" });
            }

            // Validate email format
            if (!validator.isEmail(email)) {
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
                  email,
                  password: hashedPassword
            });

            const user = await newUser.save();
            const token = createToken(user._id);

            res.json({ success: true, token });

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

export { loginUser, registerUser, adminLogin}