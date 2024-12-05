import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() => {
    try {
    const dbInastance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(`\n MONGODB CONNECTED !! DB HOST: ${dbInastance.connection.host}`);
    
        
    } catch (error) {
        console.log("MONGODB CONNECTION ERROR!! ",error);
        // throw error;
        process.exit(1); //from node
    }
}

export default connectDB;