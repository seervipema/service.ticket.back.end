const http = require('http');
exports.get_pdf_download_directly=(req,res,next)=>{
    // res.header('Access-Control-Allow-Origin','*');
    res.download(__dirname + '/Maxonic_Handbook.pdf', 'Maxonic_Handbook.pdf');

}
exports.download_pdf_data=(req,res,next)=>{
    var options = {
        method: 'GET',
        host: 'localhost',
        port: port,
        path: '/file'
      };
    
      var request = http.request(options, function(response) {
        var data = [];
    
        response.on('data', function(chunk) {
          data.push(chunk);
        });

        response.on('end',()=>{
            res.status(200).json({
          data:data
        })
        })
        
    
        // response.on('end', function() {
        //   data = Buffer.concat(data);
        //   console.log('requested content length: ', response.headers['content-length']);
        //   console.log('parsed content length: ', data.length);
        //   res.writeHead(200, {
        //     'Content-Type': 'application/pdf',
        //     'Content-Disposition': 'attachment; filename=working-test.pdf',
        //     'Content-Length': data.length
        //   });
        //   res.end(data);
        // });
      });
    
      // request.end();
    
}
