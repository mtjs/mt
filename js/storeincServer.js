/**
 * Created by .
 * User: waynelu
 * Date: 13-8-30
 * Time: 上午11:27
 * storeinc server
 */
var http = require("http");
var url = require("url");
var fs = require('fs');
var crypto = require('crypto');
var chunkDiff = require('./lib/diff/chunkDiff.js');
var mixDiff= require('./lib/diff/mixDiff.js');
//块大小
var chunkSize = 12;
var argvs = process.argv;
var diffAlg=argvs[2];
if(!diffAlg) diffAlg='lcs';
console.log(diffAlg);
var baseDir=argvs[3]||'.';
http.createServer(function(request, response) {
    //相对路径
    //var pathname = "."+url.parse(request.url).pathname;
    var pathname = baseDir+url.parse(request.url).pathname;
    var fileArray=getFileArray(pathname) ;
    var fileInfo=getFileInfo(pathname);
    if(fileInfo.extName=="html"||(fileInfo.lastver=='-1'&&fs.existsSync(pathname))) {
        var contentType="text/html; charset=utf-8";
        if(fileInfo.extName=="js"){
            contentType="application/x-javascript";
        }
        response.writeHead(200, {"Content-Type": contentType,"Access-Control-Allow-Origin":"*","Content-Encoding":"utf-8"});
        var fileContent = fs.readFileSync(pathname, {
            encoding: 'utf-8'
        });
        response.write(fileContent);
        response.end();
        return;
    }

    var outJson=[];
    for(var i=0;i<fileArray.length;i++){
        var fileitem=fileArray[i];
        pathname=fileitem.pathname+fileitem.file;

        var fileInfo=getFileInfo(pathname);
        console.log(fileInfo)
        var resultFile={};
        //是否变更
        resultFile.modify=true;
        resultFile.chunkSize=chunkSize;
        resultFile.js=fileitem.file;

        //如果是非js则
        if(!fs.existsSync(pathname)&&fileInfo.extName!="js"){
            response.writeHead(404, {"Content-Type": "application/x-javascript","Access-Control-Allow-Origin":"*","Content-Encoding":"utf-8"});
            response.write("404 notfound!");
            response.end();
            return;
        }

        else if(fileInfo.extName=="js"){
            //如果上个版本为-1,并且存该文件
            if(fileInfo.lastver=='-1'&&fs.existsSync(pathname)){

                var fileContent = fs.readFileSync(pathname, {
                    encoding: 'utf-8'
                });
                resultFile.data=fileContent;
                resultFile.inc=false;
            }
            //如果是增量更新，则计算增量更新js
            else if(fileInfo.lastver!='-1'){
                var oFile=fileInfo.filePath.replace(fileInfo.ver,fileInfo.lastver)+"/"+fileInfo.fileName+"-"+fileInfo.lastver+"."+fileInfo.extName;
                var nFile=fileInfo.filePath+"/"+fileInfo.fileName+"-"+fileInfo.ver+"."+fileInfo.extName;
                var oldFileContent="";
                //如果存在上一个版本，则计算增量更新文件并返回
                if(fs.existsSync(oFile)){
                    oldFileContent= fs.readFileSync(oFile, {
                        encoding: 'utf-8'
                    });
                }
                var incFileJson=makeIncDataFile(oldFileContent,nFile);
                resultFile=incFileJson;
                resultFile.js=fileitem.file;
                resultFile.inc=true;

            }
        }
        outJson.push(resultFile);

    }
    if(outJson.length>0){
        response.writeHead(200, {"Content-Type": "application/x-javascript","Access-Control-Allow-Origin":"*","Content-Encoding":"utf-8"});
        response.write(JSON.stringify(outJson));
    }
    else{
        response.writeHead(404, {"Content-Type": "application/x-javascript","Access-Control-Allow-Origin":"*","Content-Encoding":"utf-8"});
        response.write("");
    }

    response.end();
}).listen(6600);
    /*

     */
  function getFileArray(urlPath){
    var fileArray=urlPath.split(',');
    var path=fileArray[0];
    var reArray=[];
    for(var i=1;i<fileArray.length;i++){
        reArray.push({'pathname':path,'file':fileArray[i]});
    }
    return reArray;


  }
  //解析请求地址得到文件名，版本号，路径等信息
  function getFileInfo(path) {

    var pathArr = path.split('/');
    var name = pathArr.pop();
    var namearr = name.split('.');
    var extName = namearr.pop();
    var fileName = namearr.join('.');
    var filePath = pathArr.join('/');
    var verArr=fileName.split('-');
    var ver=verArr.pop();
    var lastver='-1';
    if(ver.indexOf('_')>0){
        verArr=ver.split('_');
        ver=verArr.pop();
        lastver=verArr.pop();
    }
    fileName=fileName.split('-').shift();
    return {
        filePath: filePath || '.',
        fileName: fileName,
        extName: extName,
        ver:ver,
        lastver:lastver,
        fullName: fileName + '.' + extName
    };
}

//根据文件内容 生成增量更新json
function makeIncDataFile(oldFileContent,newFile){

    var resultFile={};
    var nInfo=getFileInfo(newFile);
    //是否变更
    resultFile.modify=true;
    resultFile.diffAlg=diffAlg;
    resultFile.chunkSize=chunkSize;
    var strDataArray=new Array();
    var newFileContent=fs.readFileSync(newFile,{
        encoding: 'utf-8'
    });
    //计算新旧两个文件，如果相同则说明文件没有改动,则直接返回空数组
    if(getMd5(oldFileContent)==getMd5(newFileContent)){
        resultFile.modify=false;
        resultFile.data=strDataArray;
        return resultFile;
    }
    if(diffAlg=='lcs'){
        strDataArray=mixDiff.getDiff(0,oldFileContent,newFileContent);
    }
    else{
        strDataArray=chunkDiff.getDiff(oldFileContent,newFileContent,chunkSize);
    }

    resultFile.data=strDataArray;
    return resultFile;
}

//md5计算
function getMd5(c) {
    var s = c;
    var md5sum = crypto.createHash('md5');
    md5sum.update(s);
    return md5sum.digest('hex');
}