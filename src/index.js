// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/db.js";
import app from "./app.js";
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

connectDB()
.then(()=>{
  app.on("error",(error)=>{
    console.log("Err: ",error);
    throw error;
  })
  app.listen(process.env.PORT || 8000,()=>{
    console.log(` Server is running on http://localhost:${process.env.PORT}`);
    
  })
})
.catch((err)=>{
  console.log("MONGO CONNECTION FAILED! ",err);
})