var url = require('url');
var http = require('http');
var fs = require('fs');
var child_process = require('child_process');
var cfg = require('./config.js');
var incUtil = require('./inc.js');
var UglifyJS = require("uglify-js");
var util = require('./util.js');

var tempFolder = global.ROOT_PATH + '/_tmp';
var cssCompiler = global.ROOT_PATH + '/lib/yuicompressor-2.4.7.jar';
var getFileInfo = util.getFileInfo;

var dfNum = 0;
var fnNum = 0;

// 统一 build 接口
exports.build = function (target, files, urlDir, incData, incCb) {
    if (!target) {
        console.log('target file is empty!');
        return;
    }
    if ((!files) || (files.length == 0)) {
        console.log('source file can not be empty! (' + target + ')');
        return;
    }
    if (/\.js$/.test(target)) {
        buildJs(target, files, urlDir, incData, incCb); // 构建 js
        return;
    }
    if (/\.css$/.test(target)) {
        buildCss(target, files); // 构建 css
        return;
    }
};

// build js文件
function buildJs(target, files, urlDir, incData, incCb) {

    var pathInfo = getFileInfo(target);

    if(!fs.existsSync(pathInfo.filePath)){
        fs.mkdirSync(pathInfo.filePath);
    }

    var result = UglifyJS.minify(files); // 调用 UglifyJS 实现文件 合并压缩

    fs.writeFileSync(target, result.code); // 写入目标文件

    dfNum++;

    if(incData) {
        incUtil.build(incData,  function(incRt) { // 执行增量文件制作
            fnNum++;
            util.logBuildList([target, files, 'success'.green, incRt]);
            if(fnNum === dfNum) util.endLogBuildList(); // 打印结果列表
        });
    } else {
        fnNum++;
        util.logBuildList([target, files, 'success'.green, 'not'.yellow]);
        process.nextTick(function() { // 打印结果列表
            if(fnNum === dfNum) util.endLogBuildList();
        });
    }
};

// build css文件
function buildCss(target, files, ver) {
    combineFiles(target, files, ver, function (tmp, targetPath) {
        var pathInfo = getFileInfo(targetPath);
        if(!fs.existsSync(pathInfo.filePath)){
            fs.mkdirSync(pathInfo.filePath);
        }
        var cmd = 'java -jar ' + cssCompiler + ' --type css --charset utf-8 -o ' + targetPath + ' ' + tmp;
        child_process.exec(cmd,   function(error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
    });
};

// 合并 css 文件
function combineFiles(target, files, ver, cb) {
    var newFiles = [];
    var len = files.length;
    var targetInfo = getFileInfo(target);
    var processNextFile = function (f) {
        var file = files.shift();
        if (f) {
            newFiles.push(f);
        }
        if (!file) {
            return;
        }
        if (/^http:\/\//.test(file)) {
            downloadFile(file, processNextFile);
        }else {
            copyFile(file, processNextFile);
        }
    };
    var checkLen = function () {
        var s = '';
        var tmp = '';
        var targetFileInfo;
        var fileList;
        var reg;
        var realTarget;

        if (newFiles.length == len) {
            newFiles.forEach(function (itm) {
                s += fs.readFileSync(itm);
            });
            tmp = tempFolder + '/' + targetInfo.fileName + '_' + new Date().getTime() + '.' + targetInfo.extName;
            fs.writeFileSync(tmp, s);

            if (/{ver}/.test(target)) {
                realTarget = target.replace(/{ver}/g, ver);
            } else {
                realTarget = target;
            }

            targetFileInfo = getFileInfo(realTarget);
            if(!fs.existsSync(targetFileInfo.filePath)) fs.mkdirSync(targetFileInfo.filePath);

            cb && cb(tmp,  realTarget);
        }else {
            setTimeout(checkLen, 100);
        }
    };
    processNextFile();
    checkLen();
};

// 下载 css 文件
function downloadFile(fileUrl, cb, datacb) {
    var fileUrlObj = url.parse(fileUrl);

    var fileInfo = getFileInfo(fileUrlObj.pathname);
    var req = http.get(fileUrl, function(res) {
        var txt = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            txt += chunk;
            datacb && datacb();
        });
        res.on('end', function () {
            var tmp = tempFolder + '/' + fileInfo.fileName + '_' + new Date().getTime() + '.' + fileInfo.extName;
            fs.writeFileSync(tmp, txt);
            cb && cb(tmp);
        });
    });
    req.on('error', function(e) {
        err('problem with request: ' + e.message);
    });
};

// 复制文件
function copyFile(filePath, cb) {
    var s = fs.readFileSync(filePath);
    var fileInfo = getFileInfo(filePath);
    var tmp = tempFolder + '/' + fileInfo.fileName + '_' + new Date().getTime() + '.' + fileInfo.extName;
    fs.appendFileSync(tmp, s);
    cb && cb(tmp);
};
