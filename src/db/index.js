import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// const connectDB =()=>{
//     console.log(`Connecting to: ${process.env.MONGO_URI}/${DB_NAME}`);
// }

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      // `MongoDB connected with host ${connectionInstance.connection.host}`
      `Database Connected`
    );
  } catch (error) {
    console.log("MONGO DB CONNECTION FAILED:", error);
    process.exit(1);
  }
};

export default connectDB;
