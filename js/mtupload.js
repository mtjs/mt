#!/usr/bin/env node
var path = require('path');
var fs = require('fs');
var util = require('././util.js');
var config = require('././config.js');
var uploader = require('././upload.js');

var logger = util.logger;
var argvs = process.argv;
var confFile = argvs[2] || './index.jsp';
var cfg = config.readHtmlConf(confFile);
var proVer = cfg.ver; // project 类型需求项目版本号
var staticPath = cfg.staticPath;
var uploadDir;

logger.vip('启动 upload 程序：');

var buildType = cfg.buildType;

// 根据类型区分路径
if(buildType === 'project') {
    uploadDir = './release/' + proVer;
    staticPath = staticPath + '/' + proVer;
} else {
    uploadDir = './release/new';
}

logger.info('本地目录：' + uploadDir + '\r\n');
logger.info('上传过程中...\r\n');

var fileNum = 0; // 文件数
var finishNum = 0; // 已完成数

upDir(uploadDir, staticPath); // exec upload

// 调用 uploader 进行上传
function upFile(file, upPath) {
    uploader.upload(file, upPath, function() {
        finishNum++;
        logger.info(path.basename(file) + ' 上传成功'.green + '，访问路径：' + upPath)
        if(finishNum === fileNum) logger.vip('上传 cdn 过程结束。')
    }, function(e) {
        finishNum++;
        logger.info(path.basename(file) + ' 上传失败'.red + '，原因：' + e)
        if(finishNum === fileNum) logger.vip('上传 cdn 过程结束。')
    })
}

// 递归遍历文件夹 上传文件
function upDir(dir, upPath) {
    var dirList = fs.readdirSync(dir);
    dirList.forEach(function(item){
        var curItem = dir + '/' + item;
            isD = (fs.statSync(curItem)).isDirectory(),
            itemPath = upPath + '/' + item;
        if(isD) {
            upDir(curItem, itemPath);
        } else {
            fileNum++;
            upFile(curItem, itemPath);
        }
    });
}










