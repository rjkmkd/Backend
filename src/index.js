import dotenv from "dotenv"
// require("dotenv").config();
import express from "express";
import connectDb from "./db/index.js";


const app =express();

dotenv.config({
    path: "./env"
})

/*
// IFFE
;(async()=>{
    try {
        
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

       app.on("error", (error)=>{
            console.log("ERROR: ", error);
            throw error;
            
       })
       app.listen(process.env.PORT, ()=>{
        console.log(`App is listning on port ${process.env.PORT}`);
        
       })
    } catch (error) {
        console.log("Error: ",error);
        throw error
        
    }
})()

*/


connectDb();