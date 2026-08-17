import "dotenv/config";
import express from "express";
import helment from "helmet"


const app  = express(); 

app.use(express.json());
app.use(helment());






const port = process.env.port  || 3000; 

app.listen(3000 , () =>{
    console.log("server is running on port "  + port);
})




