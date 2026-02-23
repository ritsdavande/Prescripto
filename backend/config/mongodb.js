import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("database connected")
    );
    await mongoose.connect(`${process.env.MONGODB_URI}/prescripto`);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit the process if DB connection fails
  }
};

export default connectDB;
