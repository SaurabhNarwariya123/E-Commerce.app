import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log("Connecting to:", process.env.MONGODB_URI); // Debug line
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("DB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;




// import mongoose from 'mongoose';

// // Manually set the URI for testing
// const mongoUri = 'mongodb+srv://Number:6397496753@cluster0.f7pssn7.mongodb.net';

// const connectDB = async () => {
//   try {
//     if (!mongoUri) {
//       console.error('MongoDB URI is not defined.');
//       process.exit(1);
//     }

//     await mongoose.connect(mongoUri);  // Use the hardcoded URI for testing
//     console.log('MongoDB connected');
//   } catch (error) {
//     console.error(error.message);
//     process.exit(1);
//   }
// };

// export default connectDB;










