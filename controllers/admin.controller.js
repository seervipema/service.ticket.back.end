const  mysqlConnection = require('../database/mysql_database');
const  moment =require('moment');
exports.create_holiday=(req,res,next)=>{

    if(req.body.email==='admin@maxonic.com'){
        const holiday_occasion= req.body.holiday_occasion;
        const holiday_date=moment(req.body.holiday_date).format("dd-mm-yyyy");
        const is_optional=req.body.is_optional;
        const query= `INSERT INTO holidays (holiday_date,holiday_occasion,is_optional) VALUES (?,?,?)`;
        mysqlConnection.query(query,[holiday_date,holiday_occasion,is_optional],(err,rows,fields)=>{
            if(err){
                 res.status(500).json({
                     ERROR:err,
                     message:'error while creating holiday'
                 })
            }else{
                 res.status(200).json({
                     message:'Holiday created successfully...!!!'
                 })
            }
        })
    }else{
          res.status(500).json({
              message:'You are not allowed to create Holidays only admin can do.....'
          })
    }
    
}
exports.delete_holiday=(req,res,next)=>{
       
    if(req.body.email ==='admin@maxonic.com'){
        const holiday_date =req.params.holiday_date;
        const query = `DELETE FROM holidays WHERE holiday_date=?`;
        mysqlConnection.query(query,[holiday_date],(err,rows,fields)=>{
          if(err){
              res.status(500).json({
                  ERROR:err,
                  message:'error while deleting holiday'
              })
         }else{
             res.status(200).json({
                 message:'holiday deleted successfully'
             })
         }
        })
    }else{
        res.status(500).json({
            message:'You are not allowed to create Holidays only admin can do.....'
        })
    }
}
exports.get_all_holidays=(req,res,next)=>{
     const query =`SELECT * FROM holidays`;
     mysqlConnection.query(query,[],(err,rows,fields)=>{
        if(err){
            res.status(500).json({
                ERROR:err,
                message:'error while getting all holidays'
            })
       }else{
           if(rows.length >0){
            res.status(200).json({
                result:rows,
                message:'Getting all holidays successfully'
            })
           }else{
            res.status(200).json({

                message:'No holiday Found in the database'
            })
           }
          
       }
     })
}