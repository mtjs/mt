var fs = require('fs'),
    http = require('http'),
    crypto = require('crypto'),
    cfg = require('./config.js'),
    utils = require('./util.js'),
    chunkSize = 12,
    cdnDomain = cfg.getFileConfig().serverDomain;
var chunkDiff = require('../diff/chunkDiff.js');
var lcfDiff= require('../diff/lcsDiff.js');
var getFileInfo = utils.getFileInfo;

exports.build = function(incData, callback){
    var oldFileUrl = cdnDomain + incData.oldFile,
        rtMsg = '';
    var req = http.get(oldFileUrl, function(res) {
        console.log(oldFileUrl);
        var txt = '';

        res.setEncoding('utf8');
        res.on('data', function (chunk) { txt += chunk; });
        res.on('end', function () {
            if(txt.indexOf('<title>404 Not Found</title>') !== -1) {
                rtMsg = 'file 404'.red;
            } else {
                var resultFile = makeIncDataFile(txt, incData.newFile,incData.js);
                fs.writeFileSync(incData.incFileName, JSON.stringify(resultFile));

                rtMsg = 'success'.green;
            }
            callback(rtMsg);
        });
    });
    req.on('error', function(e) {
        rtMsg = 'error'.red;
        callback(rtMsg);
    });
};
function makeIncDataFile(oldFileContent,newFile,js){
    var resultFile={};
    var nInfo=getFileInfo(newFile);
    //是否变更
    resultFile.modify=true;
    resultFile.chunkSize=chunkSize;
    resultFile.js=js;
    console.log(' js: '+js);
    resultFile.inc=false;
    resultFile.diffAlg=cfg.getDiffAlg();
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
    if(cfg.getDiffAlg()=='lcs'){
        resultFile.inc=true;
        strDataArray=lcfDiff.getDiff(oldFileContent,newFileContent);
    }
    else{
        strDataArray=chunkDiff.getDiff(oldFileContent,newFileContent);
        resultFile.inc=true;
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