// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/db.js";
dotenv.config({
    path:'./.env'
})

/*
import express from "express"
const app = express()
//iffe
;(async () => {
    try {
      await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

      app.on("error",(error)=>{
        console.log("Error: ",error);
        throw error;
      })
    } catch (error) {
        console.log("Error: ",error);
        throw error;
    }
})()*/

connectDB();
