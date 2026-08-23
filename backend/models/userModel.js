import mongoose, { mongo } from "mongoose";

const addressSchema = new mongoose.Schema({
    label    : { type: String, default: 'Home' },
    firstName: { type: String, default: '' },
    lastName : { type: String, default: '' },
    street   : { type: String, required: true },
    city     : { type: String, required: true },
    state    : { type: String, default: '' },
    zipcode  : { type: String, default: '' },
    country  : { type: String, default: '' },
    phone    : { type: String, default: '' },
    lat      : { type: Number, default: null },
    lng      : { type: Number, default: null },
}, { _id: true })

const userSchema = new mongoose.Schema(
  {
    name     : { type: String, required: true },
    email    : { type: String, required: true, unique: true },
    password : { type: String, required: true },
    cartData : { type: Object, default: {} },
    addresses: { type: [addressSchema], default: [] },

    // Email verification (registration OTP)
    isEmailVerified : { type: Boolean, default: false },
    emailOtp         : { type: String, default: null },
    emailOtpExpiry   : { type: Date,   default: null },

    // Forgot-password OTP
    resetOtp       : { type: String, default: null },
    resetOtpExpiry : { type: Date,   default: null },

    // Reward points (earned on delivered orders)
    rewardPoints : { type: Number, default: 0 },

    // Wishlist (product IDs)
    wishlist : { type: [String], default: [] },
  },{ minimize: false, timestamps: true });

  const userModel = mongoose.models.user || mongoose.model('user' , userSchema);

  export default userModel;
