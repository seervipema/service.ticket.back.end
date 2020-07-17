const bcrypt = require('bcrypt');
const jwt  =  require('jsonwebtoken');
const  mysqlConnection = require('../database/mysql_database');
const moment = require('moment');
const mailer =require('nodemailer');
let smtpTransport = mailer.createTransport({
    service:"Gmail",
    auth:{
        user:"pema@maxonic.com",
        pass:"shreeaaemataji"
    }
});
exports.user_signup=(req,res,next)=>{

    // const {email} = req.body;   
    // const query=`SELECT email FROM login where email = ?`
    // mysqlConnection.query(query,[email],function(err,rows,fields){
    //        if(err){
    //         res.status(500).json({
    //                                 ERROR:err
    //                             })
    //        }else if(rows.length >=1){
    //         return res.status(200).json({
    //                         message:'Mail exists...Please go for login'
    //                     });
    //        }else{
    //         bcrypt.hash(req.body.password,10,(err,hash)=>{
    //             if(err){
    //                 res.status(500).json({
    //                     ERROR:err
    //                 })
    //             }else{
    //                   const params={};
    //                   params.email = req.body.email;
    //                   params.pwd=hash;
    //                   params.dob = req.body.date_of_birth;
    //                   params.created_on=moment().format("YYYY-MM-DD");
    //                   mysqlConnection.query(`INSERT INTO login SET ?`,params,function(err,results,fields){
    //                         if(err){
    //                             res.status(500).json({
    //                                 ERROR:err
    //                             })
    //                         }else{
    //                           res.status(200).json({
    //                               message:'User Created',
    //                               result:results
    //                           })
    //                         }
    //                   })      
    //             }
    //         })
    //        }
    //    }) 
       var is_email_present=()=>{
           return new Promise((resolve,reject)=>{
            const {email} = req.body;   
            const query=`SELECT email FROM login where email = ?`
            mysqlConnection.query(query,[email],function(err,rows,fields){
                   if(err){
                    reject(err);
                   }else if(rows.length >=1){
                  var message='Mail exists.Please go for login'
                       reject(message)
                   }else{
                        resolve();
                   }
                })
           })
       } 
       var save_details=()=>{
           return new Promise((resolve,reject)=>{
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err){
                  reject(err);
                }else{
                      const params={};
                      params.email = req.body.email;
                      params.pwd=hash;
                    //   params.dob = req.body.date_of_birth;
                      params.created_on=moment().format("YYYY-MM-DD");
                      params.is_verified=false;
                      params.first_name=req.body.first_name;
                      params.last_name=req.body.last_name;
                      params.contact_number=req.body.contact_number;
                      mysqlConnection.query(`INSERT INTO login SET ?`,params,function(err,results,fields){
                            if(err){
                               reject(err);
                            }else{
                               var message='User Created'
                                resolve(hash);
                            }
                      })      
                }
            })
           })
           
       } 
       var sending_verification_email=(hash)=>{
           return new Promise((resolve,reject)=>{
       
            const email = req.body.email;
            var secret= "aksldjfhafjhajdfh134424hjkahahd8ru847ajhd"+hash;
            var token= jwt.sign({
             email
            },secret,{expiresIn:"1h"});
        
            var mail = {
                from:"pema@maxonic.com",
                to:email,
                subject:"Link for email verification",
                text:"Please click below link for email verification",
                html:`<a href='http://localhost:3000/user/verification/${email}/${token}'>Verify email</a>`
            }
            smtpTransport.sendMail(mail,function(error,response){
                if(error){
                    reject(err);
                }else{
                   var  message1="Message sent,check email inbox to verify email"
                    resolve(message1);
                }
                smtpTransport.close();
            })
           })
            }
            is_email_present(req,res)
                 .then(save_details)
                 .then(sending_verification_email)
                 .then((resolve)=>{
                    res.status(200).json({
                        message:resolve,
                        message1:'User created'
                    })
                 })
                 .catch((err)=>{
                     res.status(200).json({
                         error:err,
                         message:err
                     })
                 })
        
       
}
exports.after_clicked_on_verify_email=(req,res,next)=>{
    const email =req.params.email;
    const query =`SELECT pwd FROM login WHERE email = ?`
    mysqlConnection.query(query,[email],function(err,rows,fileds){
        if(err){
            res.status(500).json({
                ERROR:err,
                message:'error reset password'
            })
        }else{

            if(rows.length>0){
                var secret =  'aksldjfhafjhajdfh134424hjkahahd8ru847ajhd' +rows[0].pwd ;

                var payload = jwt.verify(req.params.token,secret,function(err,decoded){
                    if(err){
                      res.send('<div style="color: green;font-size: 2.5rem;display: flex;justify-content: center;">Take a chill pill !!! You are not allowed to verify email</div>')
                    }else{
                       
                        const query=`UPDATE login SET is_verified=? where email=?`
                        mysqlConnection.query(query,[true,email],(err,row,fields)=>{
                            if(err){
                                res.status(500).json({
                                    ERROR:err,
                                    message:'error while verifying'
                                })
                            }else{
                                res.send('<div style="color: green;font-size: 2.5rem;display: flex;justify-content: center;">Email verified successfully. now you can login in <a href="splunk-support.maxonic.com">splunk-support.maxonic.com</a></div>');
                            }
                        } )
                        
                        
                        return decoded
                    }
                });
            }else{
                res.send('<div style="color: green;font-size: 2.5rem;display: flex;justify-content: center;">Email not found in database</div>');
            }
      
        }
    })
}
exports.user_login=(req,res,next)=>{
    //  const email =req.body.email;
    // const query =`SELECT email,pwd,dob,auth FROM login WHERE email = ?`
    // mysqlConnection.query(query,[email],function(err,rows,fileds){
    //     if(err){
    //         res.status(500).json({
    //             ERROR:err,
    //             message:'error while logging in'
    //         })
    //     }else{
    //         if(rows.length>0){
    //             bcrypt.compare(req.body.password,rows[0].pwd,(err,result)=>{
    //                 if(err){
    //                     return res.status(401).json({
    //                         message:'Authentication failed .Please try again with the correct password',
    //                         error:err
    //                     })
    //                 }else{
    //                     if(result){
    //                         console.log(result);
    //                         const token = jwt.sign({
    //                             email:rows[0].email
    //                         },
    //                         // process.env.JWT_KEY
    //                         "secretpema"
    //                         ,
    //                         {
    //                             expiresIn:"1d"
    //                         } 
    //                         ) 
    //                       if(rows[0].auth === 1 ){
    //                         return res.status(200).json({
    //                             message:'Auth successful',
    //                             admin:true,
    //                             token:token,
    //                             email:email
    //                         })
    //                       }else{
    
                         
    //                         return res.status(200).json({
    //                             message:'Auth successful',
    //                             token:token,
    //                         })
    //                     }
    //                     }else if(!result){
    //                         return res.status(200).json({
    //                             message:'Authentication failed .Please try again with the correct password'
    //                         })
    //                     }
                    
    //                 }
                  
    //             })
    //         }else{
    //                   res.status(200).json({
    //                       message:'Email not found in database !!! Please sign-up first'
    //                   })
    //         }
    //     }
    // })
    var is_email_present=()=>{
        return new Promise((resolve,reject)=>{
            const email =req.body.email;
            const query =`SELECT email,pwd,dob,auth,is_verified FROM login WHERE email = ?`
            mysqlConnection.query(query,[email],function(err,rows,fileds){
                if(err){
                      reject(err);
                }else{
                    if(rows.length>0){ 
                         if(rows[0]["is_verified"]){
                             resolve(
                                {
                                    pwd:rows[0].pwd,
                                    email:rows[0].email,
                                    auth:rows[0].auth
                                } )
                         }else{
                             reject("email not verified. please verify first")
                         }
                    }else{
                        
                        var    message='Email not found in database,please sign-up first.'
                        reject(message);
                    }
                }
            })
        })
    }
    var authenticating=(obj)=>{
        return new Promise((resolve,reject)=>{
            bcrypt.compare(req.body.password,obj["pwd"],(err,result)=>{
                if(err){
                    
                    var err_message='Authentication failed .Please try again with the correct password';
                    reject(err_message);
                }else{
                    if(result){
                        console.log(result);
                        const token = jwt.sign({
                            email:obj["email"]
                        },
                        // process.env.JWT_KEY
                        "secretpema"
                        ,
                        {
                            expiresIn:"1d"
                        } 
                        ) 
                      if(obj["auth"] === 1 ){
                        resolve({
                            message:'Auth successful',
                            admin:true,
                            token:token,
                            email:email
                        })
                      }else{
    
                     
                        resolve({
                            message:'Auth successful',
                            token:token,
                        })
                    }
                    }else if(!result){
                        
                        var message='Authentication failed .Please try again with the correct password'
                         reject(message);
                    }
                
                }
              
            })
        })
    }
     is_email_present(req,res)
            .then(authenticating)
            .then((resolve)=>{
                res.status(200).json(resolve)
            })
            .catch((err)=>{
                console.log(err);
                res.status(500).json({
                    error:"error while login",
                    message:err
                })
            })

}
exports.get_all_users=(req,res,next)=>{
    const query =`SELECT *FROM login`;

    mysqlConnection.query(query,[],function(err,rows,fields){
        if(err){
            console.log(err);
            res.status(500).json({
                ERROR:err                        
            })
        }else{
            if(rows.length>0){
                res.status(200).json({
                    message:'getting all users successfully',
                    result:rows                       
                })
            }else{
                res.status(200).json({
                    message:'No User in the Database'
                })
            }
        }
    })
}
exports.delete_user=(req,res,next)=>{
    const email = req.params.email;//email of user which you have to delete
    if(email==='admin@maxonic.com'){
        res.status(200).json({
           message:'You should not delete yourself...!!!'                     
        })
    }else{
    const admin_email=req.params.admin_email;
    const query = `SELECT email,auth FROM login WHERE email = ?`
    mysqlConnection.query(query,[admin_email],function(err,rows,fields){
        if(err){
         
                console.log(err);
                res.status(500).json({
                    ERROR:err                        
                })
          
        }else if(rows[0].auth != 1){
           res.status(200).json({
               message:'You have no privileges to delete user'
           })
        }else{
            const query_delete=`DELETE FROM login WHERE email = ?`
            mysqlConnection.query(query_delete,[email],function(err,rows,fields){
                if(err){
                    console.log(err);
                res.status(500).json({
                    ERROR:err                        
                })
                }else{
                    res.status(200).json({
                        message:'User Deleted Successfully',
                        result:rows                       
                    })
                }
            }) 
        }
    })
}
}
exports.upcoming_birthday_user=(req,res,next)=>{
    const month = moment().month() +1;
    const query =`SELECT dob FROM login where MONTH(dob)=?`
    mysqlConnection.query(query,[month],function(err,rows,fileds){
        if(err){
            res.status(500).json({
                ERROR:err,
                message:'error while getting upcoming birthday '
            })
        }else{
            if(rows.length > 0 ){
                res.status(200).json({
                    result:rows,
                    message:'getting upcoming birthday successfully'
                })
            }else{
                res.status(200).json({
                    result:0,
                    message:'No birthday found in this month'
                })
            }
         
        }
    }) 

}
