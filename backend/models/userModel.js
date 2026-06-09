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
}, { _id: true })

const userSchema = new mongoose.Schema(
  {
    name     : { type: String, required: true },
    email    : { type: String, required: true, unique: true },
    password : { type: String, required: true },
    cartData : { type: Object, default: {} },
    addresses: { type: [addressSchema], default: [] },
  },{ minimize: false });

  const userModel = mongoose.models.user || mongoose.model('user' , userSchema);

  export default userModel;
