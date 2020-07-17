
var multer = require('multer');
var path = require('path');
var fs = require('fs');
const http =require('http');
const  mysqlConnection = require('../database/mysql_database');
const moment = require('moment');

var directoryPath=path.join(__dirname,'../uploads');
var otherDocumentFolderPath=path.join(__dirname,'../otherDocuments');

var store= multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads');

    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
})
//start of settings for other documents
var documentStore= multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./otherDocuments');

    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
})

//end of settings for other documents
var upload =multer({storage:store}).single('file');
var documentUpload =multer({storage:documentStore}).single('file');
exports.upload_file=(req,res,next)=>{
    upload(req,res, function(err){
        if(err){
            return res.status(501).json({error:err});
        }else{
            var query =`SELECT * FROM lca where file_path=?`;
            var file_path = path.join(__dirname,'../uploads') +'/'+ req.file.originalname;
            mysqlConnection.query(query,[file_path],(err,rows,fields)=>{
                if(err){
                    console.log(err);
                    res.status(500).json({
                        error:err,
                        message:'error while saving path of the uploaded file in the database'
                    })
                }else if(rows.length>0){
                    console.log(rows);
                    console.log("file already present in the database")
                    // fs.unlink(path.join(__dirname,'../uploads') +'/'+ req.file.filename, (err) => {
                    //     if (err){
                    //         // res.status(200).json({
                    //         //     error:err,
                    //         //     message:'error while deleting duplicate file'
                    //         //  })
                    //         console.log("error while deleting dublicate file",err);
                    //     }
                    //    console.log("dubplicate deleted successfully"); 
                    //   });
                    res.status(500).json({
                        already_present:1,
                        message:'file already present in the database'
                    }) 
                }else if(rows.length <=0){
                    console.log(rows);
                    var query=`INSERT INTO lca (uploaded_on,file_path,upload_time) values(?,?,?)`;
                    var uploaded_on=moment().format("YYYY-MM-DD");
                    var upload_time=moment().format("HH:mm:ss");
                    var file_path = path.join(__dirname,'../uploads') +'/'+ req.file.originalname;
                    console.log(file_path);
                    // console.log(path.join(__dirname,'../uploads')+req.file.path);
                    mysqlConnection.query(query,[uploaded_on,file_path,upload_time],(err,rows,fields)=>{
                        if(err){
                            console.log(err);
                            res.status(500).json({
                                error:err,
                                message:'error while saving path of the uploaded file in the database'
                            })
                        }else{
                            return res.json({originalname:req.file.originalname,uploadname:req.file.filename,success:1});
                        }
                    })
                }
        
            })
        }
    })
   
}
exports.upload_other_document_file=(req,res,next)=>{
    documentUpload(req,res, function(err){
        if(err){
            return res.status(501).json({error:err});
        }else{
            var query =`SELECT * FROM other_document where file_path=?`;
            // path.join(__dirname,'../otherDocuments') +'/'+
            var file_path =  req.file.originalname;
            mysqlConnection.query(query,[file_path],(err,rows,fields)=>{
                if(err){
                    console.log(err);
                    res.status(500).json({
                        error:err,
                        message:'error while saving path of the uploaded file in the database'
                    })
                }else if(rows.length>0){
                    console.log(rows);
                    console.log("file already present in the database")
                    res.status(500).json({
                        already_present:1,
                        message:'file already present in the database'
                    }) 
                }else if(rows.length <=0){
                    console.log(rows);
                    var query=`INSERT INTO other_document (uploaded_on,file_path,upload_time) values(?,?,?)`;
                    var uploaded_on=moment().format("YYYY-MM-DD");
                    var upload_time=moment().format("HH:mm:ss");
                    // path.join(__dirname,'../otherDocuments') +'/'+
                    var file_path = req.file.originalname;
                    console.log(file_path);
                    mysqlConnection.query(query,[uploaded_on,file_path,upload_time],(err,rows,fields)=>{
                        if(err){
                            console.log(err);
                            res.status(500).json({
                                error:err,
                                message:'error while saving path of the uploaded file in the database'
                            })
                        }else{
                            return res.json({originalname:req.file.originalname,uploadname:req.file.filename,success:1});
                        }
                    })
                }
        
            })
        }
    })
   
}
// exports.upload_other_document_file=(req,res,next)=>{
//     documentUpload(req,res,function(err){
//         if(err){
//             return res.status(501).json({error:err});
//         }
//         return res.json({originalname:req.file.originalname,uploadname:req.file.filename,success:1});
//     })
// }
exports.download_file=(req,res,next)=>{
   
        filepath = path.join(__dirname,'../uploads') +'/'+ req.body.filename;
        res.sendFile(filepath);

    
}
exports.download_other_document_file=(req,res,next)=>{
   
    filepath = path.join(__dirname,'../otherDocuments') +'/'+ req.body.filename;
    res.sendFile(filepath);


}
exports.send_all_files_name=(req,res,next)=>{

    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            // return console.log('Unable to scan directory: ' + err);
            res.status(200).json({
               error:err,
               message:'error while sending all files names'
            })
        }
            res.status(200).json({
                result:files,
                message:'getting all files names successfully'
            }) ;             
        
    })
}
exports.send_all_other_document_files_name=(req,res,next)=>{

    fs.readdir(otherDocumentFolderPath, function (err, files) {
        //handling error
        if (err) {
            // return console.log('Unable to scan directory: ' + err);
            res.status(200).json({
               error:err,
               message:'error while sending all files names'
            })
        }
            res.status(200).json({
                result:files,
                message:'getting all files names successfully'
            }) ;             
        
    })
}
exports.delete_file=(req,res,next)=>{

    fs.unlink(path.join(__dirname,'../uploads') +'/'+ req.body.filename, (err) => {
        if (err){
            res.status(200).json({
                error:err,
                message:'error while deleting file'
             })
        }else{
            var query=`DELETE FROM lca WHERE file_path=?`;
            var file_path=path.join(__dirname,'../uploads') +'/'+ req.body.filename;
            mysqlConnection.query(query,[file_path],(err,rows,fields)=>{
                if(err){
                    res.status(200).json({
                        error:err,
                        message:'error while deleting file'
                     })
                }else{
                    console.log(rows);
                    res.status(200).json({
                        message:'file deleted successfully'
                    }) ; 
                }
            })
        }
      });
}
exports.delete_other_document_file=(req,res,next)=>{

    fs.unlink(path.join(__dirname,'../otherDocuments') +'/'+ req.body.filename, (err) => {
        if (err){
            res.status(200).json({
                error:err,
                message:'error while deleting file'
             })
        }else{
            var query=`DELETE FROM other_document WHERE file_path=?`;
            // path.join(__dirname,'../otherDocument') +'/' +
            var file_path= req.body.filename;
            mysqlConnection.query(query,[file_path],(err,rows,fields)=>{
                if(err){
                    res.status(200).json({
                        error:err,
                        message:'error while deleting file'
                     })
                }else{
                    console.log(rows);
                    res.status(200).json({
                        message:'file deleted successfully'
                    }) ; 
                }
            })
        }
      });
}
// exports.send_pdf_file=(req,res,next)=>{
//     var options = {
//         method: 'GET',
//         host: 'localhost',
//         port: '3000',
//         path: '/file/file'
//       };
    
//       var request = http.request(options, function(response) {
//         var data = [];
    
//         response.on('data', function(chunk) {
//           data.push(chunk);
//         });
    
//         response.on('end', function() { 
//           data = Buffer.concat(data);
//           console.log('requested content length: ', response.headers['content-length']);
//           console.log('parsed content length: ', data.length);
        //   res.writeHead(200, {
        //     'Content-Type': 'application/pdf',
        //     'Content-Disposition': `attachment; filename=${req.body.filename}`,
        //     'Content-Length': data.length,
        //     'data':data
        //   });
      
        // res.contentType("application/pdf");
        // res.set("Content-Transfer-Encoding", "binary");
        // res.status(200);
        // res.end(data);
//         });
//       });
    
//       request.end();
// }
exports.file_sending=(req,res,next)=>{
    // var query =`SELECT file_path FROM lca ORDER BY uploaded_on,upload_time DESC LIMIT 1`;
    var query =` SELECT * FROM (SELECT * FROM lca ORDER BY uploaded_on  DESC) as lca1 ORDER BY lca1.upload_time DESC LIMIT 1;`
    mysqlConnection.query(query,[],(err,rows,fields)=>{
        if(err){
            res.status(200).json({
                error:err,
                message:'error while sending pdf file'
             })
        }else{
            if(rows.length>0){
                res.sendFile(rows[0].file_path);
            }else{
                res.status(200).json({
                    message:'LCA Pdf file not found',
                    success:0
                })
            }
           
        }
    });
}
exports.sending_latest_other_document_file=(req,res,next)=>{
    // var query =`SELECT file_path FROM lca ORDER BY uploaded_on,upload_time DESC LIMIT 1`;
    var query =` SELECT * FROM (SELECT * FROM other_document ORDER BY uploaded_on  DESC) as lca1 ORDER BY lca1.upload_time DESC LIMIT 1;`
    mysqlConnection.query(query,[],(err,rows,fields)=>{
        if(err){
            res.status(200).json({
                error:err,
                message:'error while sending pdf file'
             })
        }else{
            if(rows.length>0){
                res.sendFile(path.join(__dirname,'../otherDocuments') +'/' + rows[0].file_path);
            }else{
                res.status(200).json({
                    message:'other document file not found',
                    success:0
                })
            }
           
        }
    });
}