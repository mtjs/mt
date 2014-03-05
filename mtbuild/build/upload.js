var fs = require('fs');
var http = require('http');
var fileName = 'test.js';
var UP_HOST = "xxx.aaa.com";
var UP_PATH = "/xxx/uploader.jsp";

var upload = function(path, cdnPath, sucCB, failCB) {
    var datas = fs.readFileSync(path);

    var boundary = "---------------------------leon";
    var formStr = '--' + boundary + '\r\n'
        + 'Content-Disposition: form-data; name="filePath1"' + '\r\n\r\n'
        + cdnPath + '\r\n'
        + '--' + boundary + '\r\n'
        + 'Content-Disposition: form-data; name="content1"; filename="'+ fileName +'"' + '\r\n'
        + 'Content-Type: application/octet-stream' + '\r\n\r\n';
    var formEnd = '\r\n--' + boundary + '--\r\n';
    var options = {
        host : UP_HOST,
        port : 80,
        method : "POST",
        path : UP_PATH,
        headers : {
            "Content-Type" : "multipart/form-data; boundary=" + boundary,
            "Content-Length" : formStr.length + datas.length + formEnd.length
        }
    };

    var req = http.request(options, function(res) {
        res.on('data', function(data) {
            if(res.statusCode == 200) {
                sucCB();
            } else {
                if(failCB) failCB('err msg：' + data.toString().trim());
            }
        });
    });

    req.write(formStr);
    req.write(datas);
    req.write(formEnd);
    req.end();
};

exports.upload = upload;
