const  mysqlConnection = require('../database/mysql_database');
const shortid= require('shortid');
const moment = require('moment');
const mailer =require('nodemailer');
let smtpTransport = mailer.createTransport({
    service:"Gmail",
    auth:{
        user:"pema@maxonic.com",
        pass:"shreeaaemataji"
    }
});
exports.store_request_details=(req,res,next)=>{
    let check_if_title_already_present=()=>{
        return new Promise((resolve,reject)=>{
            const query=`SELECT request_title FROM requests where request_title=? AND requested_by=?`;
            const request_title=req.body.request_title;
            mysqlConnection.query(query,[request_title,req.body.requested_by],(err,rows,fields)=>{
                if(err){
                        reject(err);
                }else{
                        if(rows.length>0){
                            reject({ 
                                message:"Request is already created with this title."});
                        }else{
                            resolve();
                        }
                }
            })
        })
    }
    let store_details=()=>{
        return new Promise((resolve,reject)=>{
            const request_id=shortid.generate();
            const request_date= moment().format("YYYY-MM-DD");
            const query=`INSERT INTO requests (request_id,request_title,request_description,requested_by,request_date,request_status,request_resolved_by,method_of_contact) VALUES(?,?,?,?,?,?,?,?)`
            mysqlConnection.query(query,[request_id,req.body.request_title,req.body.request_description,req.body.requested_by,request_date,req.body.request_status,req.body.request_resolved_by,req.body.method_of_contact],(err,rows,fields)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(request_id);
                }
            })
        })
    }
    let get_user_details=(rows)=>{
        return new Promise((resolve,reject)=>{
            const query=`SELECT *FROM login where email=?`;
            const email=rows[0]["requested_by"];
            mysqlConnection.query(query,[email],(err,result,fields)=>{
                if(err){
                    reject(err);
                }else{
                    if(result.length>0){
                        let full_name=result[0]["first_name"]+" "+ result[0]["last_name"];
                        rows.push(full_name);
                        let contact_number=result[0]["contact_number"];
                        rows.push(contact_number);
                        resolve(rows);
                    }
                }
            })
        })
    }
    let get_stored_ticket_details=(id)=>{
       return new Promise((resolve ,reject)=>{
           const query=`SELECT *FROM requests where request_id=?`;
           const request_id=id;
           mysqlConnection.query(query,[request_id],(err,rows,fields)=>{
               if(err){
                   reject(err);
               }
               else{
                   if(rows.length>0){
                       resolve(rows);
                   }
               }
           })

       })

    }
    let send_email_to_both=(rows)=>{
        return new Promise((resolve,reject)=>{
            if(rows){
                if(rows[0]["method_of_contact"]==="Email"){
                    var mailOptions={
                        from :'pema@maxonic.com',
                        to:`${rows[0]["requested_by"]},pema@maxonic.com,nitish@maxonic.com,nishant@maxonic.com,paduka@maxonic.com,anjali@maxonic.com,nayana@maxonic.com,sudhir@maxonic.com`,
                        subject:`Ticket generated with id ${rows[0]["request_id"]}`,
                        text:'Hi,Please find detials regarding generated ticket',
                        html:`<div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Summary of Requested Ticket:</b></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Requested By</b> : ${rows[1]}</font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Preferred Method of Contact
                        </b>: Email (${rows[0]["requested_by"]})</font></font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Short Description</b> : ${rows[0]["request_title"]}</font></font></font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Description</b> :${rows[0]["request_description"]}</font></font></font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        </font></font></font></div>
                        </div>`
                    }
                }else{
                    var mailOptions={
                        from :'pema@maxonic.com',
                        to:`${rows[0]["requested_by"]},pema@maxonic.com,nitish@maxonic.com,nishant@maxonic.com,paduka@maxonic.com,anjali@maxonic.com,nayana@maxonic.com,sudhir@maxonic.com`,
                        subject:`Ticket generated with id ${rows[0]["request_id"]}`,
                        text:'Hi,Please find detials regarding generated ticket',
                        html:`<div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Summary of Requested Ticket:</b></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Requested By</b> : ${rows[1]}</font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Preferred Method of Contact
                        </b>: Phone(${rows[2]})</font></font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Short Description</b> : ${rows[0]["request_title"]}</font></font></font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Description</b> :${rows[0]["request_description"]}</font></font></font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        </font></font></font></div>
                        </div>`
                    }
                }
             smtpTransport.sendMail(mailOptions,(error,response)=>{
                 if(error){
                     reject(error);
                 }else{

                     resolve({
                         message:'Ticket generated and email sent to all the participants'
                     })
                 }
             })
            }
        })
    }
   check_if_title_already_present(req,res).then(store_details).then(get_stored_ticket_details).then(get_user_details).then(
        send_email_to_both
    ).then((resolve)=>{
         res.status(200).json(resolve)
    })
    .catch((err)=>{
         res.status(500).json(err);
    })
}
exports.get_request_details=(req,res,next)=>{
       const query=`SELECT *FROM requests WHERE requested_by=?`;
       mysqlConnection.query(query,[req.params.email,"pending"],(err,rows,fields)=>{
             if(err){
                 res.status(500).json({
                     error:err,
                 })
             }else{
                 if(rows.length>0){
                     res.status(200).json({
                         result:rows,
                         message:"getting all data successfully"
                     })
                 }else{
                     res.status(500).json({
                         message:'No pending request found in database'
                     })
                 }
             }
       })  
}
exports.get_request_details_for_admin=(req,res,next)=>{
      const query=`SELECT *FROM requests where request_status=?`;
       mysqlConnection.query(query,["pending"],(err,rows,fields)=>{
             if(err){
                 res.status(500).json({
                     error:err,
                 })
             }else{
                 if(rows.length>0){
                     res.status(200).json({
                         result:rows,
                         message:"getting all data successfully"
                     })
                 }else{
                    res.status(500).json({
                        message:'No pending request found in database'
                    })
                }
             }
       })  
}
exports.resolve_request=(req,res,next)=>{
    
    let update_request_status=()=>{
        return new Promise((resolve,reject)=>{
      const request_id = req.body.request_id;
      const query = `UPDATE requests set request_resolved_by =? , request_status=? where request_id=?`;
      mysqlConnection.query(query,[req.body.email,"fixed",request_id],(err,rows,fields)=>{
            if(err){
               reject(err);
            }else{
                resolve(request_id);
            }

      })
        })
    }
    let get_stored_ticket_details=(id)=>{
       return new Promise((resolve ,reject)=>{
           const query=`SELECT *FROM requests where request_id=?`;
           const request_id=id;
           mysqlConnection.query(query,[request_id],(err,rows,fields)=>{
               if(err){
                   reject(err);
               }
               else{
                   if(rows.length>0){
                       resolve(rows);
                   }
               }
           })

       })

    }
    let get_user_details=(rows)=>{
        return new Promise((resolve,reject)=>{
            const query=`SELECT *FROM login where email=?`;
            const email=rows[0]["requested_by"];
            mysqlConnection.query(query,[email],(err,result,fields)=>{
                if(err){
                    reject(err);
                }else{
                    if(result.length>0){
                        let full_name=result[0]["first_name"]+" "+ result[0]["last_name"];
                        rows.push(full_name);
                        let contact_number=result[0]["contact_number"];
                        rows.push(contact_number);
                        resolve(rows);
                    }
                }
            })
        })
    }
    let send_email_to_both=(rows)=>{
        return new Promise((resolve,reject)=>{
            if(rows){
                if(rows[0]["method_of_contact"]==="Email"){
                    var mailOptions={
                        from :'pema@maxonic.com',
                        to:`${rows[0]["requested_by"]},pema@maxonic.com,nitish@maxonic.com,nishant@maxonic.com,paduka@maxonic.com,anjali@maxonic.com,nayana@maxonic.com,sudhir@maxonic.com`,
                        subject:`Your Ticket ${rows[0]["request_id"]} has been resolved`,
                        text:'Hi,Please find detials regarding resolved ticket',
                        html:`<div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Summary of Resolved Ticket:</b></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Requested By</b> : ${rows[1]}</font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Preferred Method of Contact
                        </b>: Email (${rows[0]["requested_by"]})</font></font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Short Description</b> : ${rows[0]["request_title"]}</font></font></font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Description</b> :${rows[0]["request_description"]}</font></font></font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                         &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Resolved By</b> :${rows[0]["request_resolved_by"]}</font></font></font></font>
                        </div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        </font></font></font></div>
                        </div>`
                    }
                }else{
                    var mailOptions={
                        from :'pema@maxonic.com',
                        to:`${rows[0]["requested_by"]},pema@maxonic.com,nitish@maxonic.com,nishant@maxonic.com,paduka@maxonic.com,anjali@maxonic.com,nayana@maxonic.com,sudhir@maxonic.com`,
                        subject:`Your Ticket ${rows[0]["request_id"]} has been resolved`,
                        text:'Hi,Please find detials regarding resolved ticket',
                        html:`<div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Summary of Resolved Ticket:</b></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Requested By</b> : ${rows[1]}</font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Preferred Method of Contact
                        </b>: Phone(${rows[2]})</font></font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Short Description</b> : ${rows[0]["request_title"]}</font></font></font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Description</b> :${rows[0]["request_description"]}</font></font></font></font></div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        &nbsp;&nbsp;&nbsp;&nbsp; <font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><b>Resolved By</b> :${rows[0]["request_resolved_by"]}</font></font></font></font>
                        </div>
                        <div><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><font style="font-family:Arial,Helvetica,sans-serif;font-size:12px"><br>
                        </font></font></font></div>
                        </div>`
                    }
                }
             smtpTransport.sendMail(mailOptions,(error,response)=>{
                 if(error){
                     reject(error);
                 }else{

                     resolve({
                         message:'Ticket resolved and email sent to all the participants'
                     })
                 }
             })
            }
        })
    }

     update_request_status(req,res).then(
         get_stored_ticket_details
     ).then(get_user_details).then(send_email_to_both)
     .then((resolve)=>{
         res.status(200).json(resolve)
      })
     .catch((err)=>{
         res.status(500).json(err);
      })
}