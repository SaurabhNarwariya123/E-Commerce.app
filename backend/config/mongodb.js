import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("DB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;











