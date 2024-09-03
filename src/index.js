import dotenv from "dotenv"
dotenv.config({
  path: "./env",
});
import connectDb from "./db/index.js";
import app from "./app.js";

const port = process.env.PORT || 8000

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


connectDb()
.then(()=>{

    app.on("error",(err)=>{
        console.log("Error: ",err);
        throw err;
        
    })

    app.listen(port,()=>{
        console.log(` Server is running  on port ${port}`);
        
    })
})
.catch((err)=>{
    console.log(`Mongodb connection failed`, err)
})