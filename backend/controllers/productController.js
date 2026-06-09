import { v2 as cloudinary } from 'cloudinary'
import productModel from '../models/productModel.js'


// function for add product 

 const addProduct = async(req,res)=>{  
    try {
          const  {name, description, price, category, subCategory, sizes, bestseller, stock } = req.body

          const image1 = req.files.image1 && req.files.image1[0];
          const image2 = req.files.image2 && req.files.image2[0];
          const image3 = req.files.image3 &&  req.files.image3[0];
          const image4 = req.files.image4 &&  req.files.image4[0];

          const images = [image1,image2,image3,image4].filter((item)=> item !== undefined)

          let imageUrl = await Promise.all(
            images.map(async (item) =>{
                let result = await cloudinary.uploader.upload(item.path,{resource_type:'image'});
                 return result.secure_url
            })
          )

         const parsedSizes = JSON.parse(sizes)

         // stock initialize: { S: 0, M: 0, ... } — admin baad mein update kar sakta hai
         let stockData = {}
         if (stock) {
             stockData = typeof stock === 'string' ? JSON.parse(stock) : stock
         } else {
             parsedSizes.forEach(s => { stockData[s] = 0 })
         }

         const productData = {
             name,
             description,
             category,
             price: Number(price),
             subCategory,
             bestseller: bestseller === "true" ? true : false,
             sizes: parsedSizes,
             image:imageUrl,
             date:Date.now(),
             stock: stockData
         }

         console.log(productData);

         const product = new productModel(productData);
          await product.save()

          res.json({ success:true, message:"Product Added"})


    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})

    }

 } 
// function for list product 

 const listProduct = async(req,res)=>{

    try {
      const docs = await productModel.find({});
      // Serialize Map → plain object so frontend can do product.stock['S']
      const products = docs.map(d => {
          const obj = d.toObject()
          if (obj.stock instanceof Map) obj.stock = Object.fromEntries(obj.stock)
          return obj
      })
      res.json({success:true , products})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})

    }


 }


 
// function for add product 

 const removeProduct = async(req,res)=>{

      try {
         await productModel.findByIdAndDelete(req.body.id)
         res.json({success:true,message:"Product Removed"})
        
      } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})

    }
    
 }

 
// function for singleproduct 

 const singleProduct = async(req,res)=>{
    
      try {
        const {productId} = req.body
        const product = await productModel.findById(productId);
        res.json({success:true,product})

        
      } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})

    }

 }

 export {listProduct,addProduct,removeProduct,singleProduct}