import mongoose, { Mongoose } from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async()=>{

    try {

        const connectionInstance = await mongoose.connect(
          `${process.env.MONGODB_URI}/${DB_NAME}`
        );
        // console.log(connectionInstance);
        
        console.log(`\n MONGODB CONNECTED !! DB HOST: ${connectionInstance.connection.host}`);
        

    } catch (error) {
        console.log("MONGODB CONNECTION FAILED ",error);

        process.exit(1)
    }
}

export default connectDb;