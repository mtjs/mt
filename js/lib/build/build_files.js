var fs = require('fs'),
    buildUtil = require('./build.js'),
    cfg = require('./config.js'),
    fileConfig = cfg.getFileConfig(),
    jsMap = fileConfig.jsmap,
    util = require('./util.js'),
    getFileInfo = util.getFileInfo,
    logger = util.logger;

exports.build = function (conf) {

    logger.vip('启动多文件版本方式（buildType:file） build...');

    solveDir();
    cfg.serNewVer(fileConfig.ver);

    var k;
    for(k in conf) {
        if (conf.hasOwnProperty(k)) {
            var pagesItem = conf[k];

            //处理虚拟页目录,虚拟页目录统一扔到release/{ver}/下面，其他的可自定义
            if(k === "pages"){
                var pagesDir = pagesItem.dir;
                var releaseDir = pagesItem.releaseDir;
                var pageCombo = pagesItem.pageCombo || {};

                //遍历pages目录，压缩混淆里面的每个js
                if (fs.existsSync(pagesDir)) {
                    var dirList = fs.readdirSync(pagesDir);
                    dirList.forEach(function(item){
                        var target = releaseDir + item;
                        target = target.replace(".js", "-{fv}.js");
                        var files = pageCombo[item] || [pagesDir + "/" + item]; // 处理 page 内存在 pageCombo 的情况
                        var fv = getItemFV(files);

                        target = target.replace(/{pv}/g, 'new');
                        target = target.replace(/{fv}/g, fv);

                        var incData = getIncData(target, fv);
                        buildUtil.build(target, files, pagesItem.urlDir, incData); // 执行 build 操作
                    });
                }
            } else {
                var fv = getItemFV(pagesItem.files, pagesItem.fvName);

                k = k.replace(/{pv}/g, 'new');
                k = k.replace(/{fv}/g, fv);

                var incData = getIncData(k, fv);
                buildUtil.build(k, pagesItem.files, pagesItem.urlDir, incData); // 执行 build 操作
            }
        }
    }
};

/**
 * 生成增量信息
 * incData.newFile 新文件
 * incData.oldFile 上一版本文件
 * incData.incFileName 增量文件名
 */
function getIncData(target, fv) {
    if(fv === '001') return false;

    var curVer = fv,
        targetInfo = getFileInfo(target),
        oldVersion = util.fixZero(--fv, 3),
        incData = {},
        cdnPath = fileConfig.staticPath,
        oldPath = target.replace('./release/new', cdnPath);

    incData.newFile = target;
    incData.js=target.replace('.release/new','');
    incData.oldFile = oldPath.replace(curVer, oldVersion);
    incData.incFileName = (targetInfo.filePath) + "/"
        + (targetInfo.fullName).replace(curVer, oldVersion + "_" + curVer);

    return incData;
}

// 处理 new 文件夹 如果已有则清空
function solveDir() {
    if(!fs.existsSync("release/new")){
        fs.mkdirSync("release/new");
    }else{
        util.clearDir("release/new");
    }
}

// 获取单个文件的版本号
function getItemFV(files, fvName) {
    var fvn = fvName || files[0],
        fileName = getFileInfo(fvn).fullName,
        key, value, verSplit;
    for(key in jsMap) {
        value = getFileInfo(jsMap[key]).fullName;
        if(value.indexOf(fileName) === 0) { // 检查如 ?002 的版本类型 默认为 001
            verSplit = value.split('?');
            if (verSplit.length < 2) return '001';
            return verSplit[1];
        }
    }
    return '001';
}

