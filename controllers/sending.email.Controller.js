const mailer =require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const  mysqlConnection = require('../database/mysql_database');

//Use Smtp protocol to send email
let smtpTransport = mailer.createTransport({
    service:"Gmail",
    auth:{
        user:"pema@maxonic.com",
        pass:"shreeaaemataji"
    }
});
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
exports.send_email_with_coupon_code=(req,res,next)=>{
    const email = req.body.email;
    const query =`SELECT pwd FROM login WHERE email = ?`
    mysqlConnection.query(query,[email],function(err,rows,fileds){
        if(err){
            res.status(500).json({
                ERROR:err,
                message:'error in sending email for reset password'
            })
        }else{
            if(rows && rows[0]){
                
                var secret= "aksldjfhafjhajdfh134424hjkahahd8ru847ajhd"+rows[0].pwd;
                var token= jwt.sign({
                 email
                },secret,{expiresIn:"1h"});
            
                var mail = {
                    from:"pema@maxonic.com",
                    to:email,
                    subject:"Link to reset password",
                    text:"Please click below link for resetting password",
                    html:`<a href='http://34.217.192.84:3000/email/reset-password/${email}/${token}'>Enter your new password</a>`
                }
                smtpTransport.sendMail(mail,function(error,response){
                    if(error){
                        console.log(error);
                    }else{
                        res.status(200).json({
                            message:"Check your email inbox to reset the password"
                        })
                    }
                    smtpTransport.close();
                })
            }else{
                  res.status(500).json({
                      message:'Email not found in database'
                  })
            }
        }
    })
}
exports.after_user_clicked_reset_password_in_email=(req,res,next)=>{
    
        // TODO: Fetch user from database using
        // req.params.id
        // TODO: Decrypt one-time-use token using the user's
        // current password hash from the database and combine it
        // with the user's created date to make a very unique secret key!
        // For example,
        const email =req.params.email;
        const query =`SELECT pwd FROM login WHERE email = ?`
        mysqlConnection.query(query,[email],function(err,rows,fileds){
            if(err){
                res.status(500).json({
                    ERROR:err,
                    message:'error reset password'
                })
            }else{

                var secret =  'aksldjfhafjhajdfh134424hjkahahd8ru847ajhd' +rows[0].pwd ;

                var payload = jwt.verify(req.params.token,secret,function(err,decoded){
                    if(err){
                        console.log(err);
                      res.send('<div style="color: green;font-size: 2.5rem;display: flex;justify-content: center;">Take a chill pill. You are not allowed to reset password</div>')
                    }else{
                        return decoded
                    }
                });
    
                // TODO: Gracefully handle decoding issues.
                // Create form to reset password.
                res.send('<form action="/email/reset-password" method="POST" style="display: flex;justify-content: center;margin-top:10%">' +
                    '<input type="hidden" name="email" value="' + payload.email + '" />' +
                    '<input type="hidden" name="token" value="' + req.params.token + '" />' +
                    '<input type="text" name="password" value="" placeholder="Enter your new password..." style="border: 1px solid black;font-weight: 600;font-size: 1em;padding: 11px;color: black;border-radius: 5px;margin-right:2%"/>'+
                    '<input type="submit" value="Reset Password" style="background: #fb641b;border: #fb641b;font-weight: 600;font-size: 1em;padding: 11px;color: white;border-radius: 5px;" />' +
                '</form>');
            }
        })
}
exports.save_reset_password=(req,res,next)=>{

       
       const email =req.body.email;
       const query =`SELECT pwd FROM login WHERE email = ?`
       mysqlConnection.query(query,[email],function(err,rows,fileds){
           if(err){
               res.status(500).json({
                   ERROR:err,
                   message:'error while reset password '
               })
           }else{
              if(rows.length>0){
                
                var secret =  'aksldjfhafjhajdfh134424hjkahahd8ru847ajhd' +rows[0].pwd ;

                var payload = jwt.verify(req.body.token,secret,function(err,decoded){
                    if(err){
                       return res.status(500).json({
                            message:'error while verifying token'
                        })
                    }else{
                        bcrypt.hash(req.body.password,10,(err,hash)=>{
                            if(err){
                                res.status(500).json({
                                    ERROR:err
                                })
                            }else{
                                const query=`UPDATE login SET pwd=? WHERE email=?`;
                                mysqlConnection.query(query,[hash,decoded["email"]],function(err,rows,fileds){
                                    if(err){
                                        res.status(500).json({
                                            ERROR:err,
                                            message:'error while reset password '
                                        })
                                    }else{
                                          
                                            //    res.status(200).json({
                                            //        message:"password updated successfully"
                                            //    })
                                            res.send('<div style="color: green;font-size: 2.5rem;display: flex;justify-content: center;">password updated successfully</div>');
                                           
                                    }})   
                            }
                        })
                      
                    }
                });


              }else{
                  res.status(500).json({
                      message:"email no found in the database"
                  })
              }

           }})

    
            
}