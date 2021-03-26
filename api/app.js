const express = require('express');
const bodyParser = require('body-parser')
const app = express();
require('dotenv').config();
const placesRouter = require('./routes/places-route')
const userRouter = require('./routes/users-route')
const mongoose = require('mongoose');
app.use(bodyParser.json())
app.use('/places',placesRouter);
app.use('/users',userRouter);

//mongoDB connection


app.use((error,req,res,next)=>{
    if(req.headerSent){
        return next(error)
    }
    res.status(error.code || 500).json({message:error.message ||' An unknown error occurred'})

});


const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
.then(()=>{
    console.log("MongoDB database connection established successfully");
    app.listen(5353, ()=>{ console.log('app runing on localhost:5353');})
})
.catch(err => console.log(err))
 

// const connection = mongoose.connection;    
// connection.once('open', () => {
//     console.log("MongoDB database connection established successfully");
// }) 
// connection.on('error',(err)=>{
//   console.log(err.message) 
// }) 

// connection.on('disconnected',()=>{
//   console.log('mongoDB connection disconnected');
// })
