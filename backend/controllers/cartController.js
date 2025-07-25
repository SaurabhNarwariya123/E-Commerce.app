
import userModel from "../models/userModel.js";

// Add product to user cart
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size } = req.body;
    const userData = await userModel.findById(userId);
    let cartData =  await userData.cartData || {}

    // Add item to cart logic
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
     await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true,message: "Added To Cart"});

  } catch (error) {
    console.log( error);
    res.json({success: false, message: error.message });
  }
};

//  Update user Cart
const updateCart = async (req,res) =>{

     try {
         const {userId , itemId,size,quantity} = req.body
         const userData = await userModel.findById(userId)

          let cartData = await userData.cartData;
           cartData[itemId][size] = quantity

        await userModel.findByIdAndUpdate(userId, {cartData})
         res.json({success: true , message : "Cart Update " })



     } catch (error) {
        console.log(error)
        res.json({success: false , message : error.message})
     }
    
}



//   get User cart data
const getUserCart = async (req,res) =>{

    try {
        const{userId} = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        res.json({success:true, cartData})


    } catch (error) {
         console.log(error)
          res.json({success: false , message : error.message})

    }
    
}

export  { addToCart,getUserCart, updateCart}