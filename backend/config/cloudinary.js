import {v2 as cloudinary} from "cloudinary"

const connectCloudinary = async () => {
    const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET_KEY } = process.env;

    if (!CLOUDINARY_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_SECRET_KEY) {
        console.error('Cloudinary config missing. Ensure CLOUDINARY_NAME, CLOUDINARY_API_KEY and CLOUDINARY_SECRET_KEY are set.');
        throw new Error('Missing Cloudinary configuration (CLOUDINARY_API_KEY/CLOUDINARY_NAME/CLOUDINARY_SECRET_KEY)');
    }

    cloudinary.config({
        cloud_name: CLOUDINARY_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_SECRET_KEY
    });
}

export default connectCloudinary;