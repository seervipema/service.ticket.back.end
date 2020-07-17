const jwt = require('jsonwebtoken');
module.exports = (req,res,next)=>{
    try{
        console.log("req.headers",req.headers)
        const token = req.headers.authorization.split(" ")[1];
        console.log("token=",token)
        // const decoded= jwt.verify(token,process.env.JWT_KEY)
        const decoded= jwt.verify(token,"secretpema")
        req.userData= decoded;
        next();
    }catch(err){
        return res.status(200).json({
            message:'Authantication Failed',
            failed:true
        })
    }
     
}