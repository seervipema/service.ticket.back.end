const express = require('express')
const morgan = require('morgan')
const app =  express();
const bodyParser= require('body-parser');
// const mongoose = require('mongoose');
const mysql=require('mysql');
const fs = require('fs');

 const userRouter = require('./routes/userRoutes')
 const pdfRouter = require('./routes/pdfRoutes');
 const emailRouter= require('./routes/sendingEmailsRoutes');
 const adminRouter = require('./routes/adminRoutes');
 const fileRouter= require('./routes/fileRoutes');
 const requestRouter= require('./routes/requestRoutes');
// mongoose.connect('mongodb://localhost:27017/shopping',{
//     useUnifiedTopology: true,
//     useNewUrlParser: true 
// },(err)=>{
//     if(err){
//         console.log("error while connecting mongodb",err);
//     }
//     console.log("Db is connected")
// })
// mongoose.Promise=global.Promise;

//database mysql connection settings
// app.use(function(req,res,next){
//     res.locals.connection = mysql.createConnection({
//         host:'http://34.217.192.84/phpmyadmin',
//         user:'phpmyadmin',
//         password:'r51G2WUnqSKRn8w4',
//         database:'maxonic'
//     });
//     res.locals.connect();
//     next();
// })
// const mysqlConnection = mysql.createConnection({
//     host:'localhost',
//     port:'3306',         
//     user:'root',
//     password:'',
//     database:'maxonic'
// }) 

// mysqlConnection.connect(function(error){
//     if(!!error){
//         console.log('error',error);
//     }else{
//         console.log('db is connected')
//     }
// })

// module.exports =mysqlConnection;

/////////////////////////////end of mysql connection setting

////////////////
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());
// app.use('/uploads',express.static('uploads')); //make upload folder public which start with /uploads URL
//below code was added to allow cross origin client to access the api's
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','http://localhost:4200');//here * means you are allowing all the client you also restrict like https://pema.com only can access these api's
    res.header('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization');
    res.header('Access-Control-Allow-Credentials',true);
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
        return res.status(200).json({});
    }
    next();
})

//routes which should handle the requests
app.use('/user',userRouter);//forward the any request which is starting with /user to the userRouter file where it can be handled properly
app.use('/pdf_download',pdfRouter);
app.use('/email',emailRouter);
app.use('/holidays',adminRouter);
app.use('/file',fileRouter);
app.use('/request',requestRouter);
//after all routes if routes not found then below code will be executed
app.use((req,res,next)=>{
    const error =  new Error('Not Found');
    error.status=404 
    next(error)
})

// below code will be triggered when any error will occures in any part of the application
app.use((error,req,res,next)=>{
    res.status(error.status || 500)
    res.json({
       error:{
           message:error.message
       }
    })
})



module.exports = app;