/**
 * 项目统一版本号方式的 构建系统
 * @buildType project
 */
var fs = require('fs'),
    buildUtil = require('./build.js'),
    cfg = require('./config.js'),
    fileConfig = cfg.getFileConfig(),
    oldVersion = fileConfig.ver,
    util = require('./util.js'),
    logger = util.logger,
    getFileInfo = util.getFileInfo;

exports.build = function (conf) {

    logger.vip('启动项目单版本方式（buildType:project） build...');

    updateVer(); // 更新 项目版本号

    logger.info('旧项目版本：' + oldVersion + ', 新项目版本：' + cfg.getNewVer() + '\n');

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

                        target = target.replace(/{pv}/g, cfg.getNewVer());
                        target = target.replace(/{fv}/g, cfg.getNewVer());

                        var files = pageCombo[item] || [pagesDir + "/" + item];

                        var incData = getIncData(target);
                        buildUtil.build(target, files, pagesItem.urlDir, incData); // 执行 build
                    });
                }
            } else {
                k = k.replace(/{pv}/g, cfg.getNewVer());
                k = k.replace(/{fv}/g, cfg.getNewVer());

                var incData = getIncData(k);
                buildUtil.build(k, pagesItem.files, pagesItem.urlDir, incData); // 执行 build
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
function getIncData(target) {
    var curVer = cfg.getNewVer(),
        targetInfo = getFileInfo(target),
        cdnPath = fileConfig.staticPath;

    if((targetInfo.filePath).indexOf(curVer) === -1) return false;

    var oldPath = target.replace('./release', cdnPath),
        incData = {};

    incData.newFile = target;
    incData.oldFile = oldPath.replace(curVer, oldVersion).replace(curVer, oldVersion);
    incData.incFileName = (targetInfo.filePath) + "/"
        + (targetInfo.fullName).replace(curVer, oldVersion + "_" + curVer);

    return incData;
}

// 更新项目版本号
function updateVer() {
    var v = oldVersion;
    var per = '00';
    var now = new Date();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var today = now.getFullYear() + util.fixZero(month, 2) + util.fixZero(day, 2);
    var vCount,newVer;
    if (!v) v = today + per + '001';
    vCount = parseInt(v.slice(-3));
    //如果到999重新从0开始
    if (vCount === 999) vCount = 0;

    vCount = util.fixZero(++vCount, 3); // 版本号 +1
    newVer = today + per + vCount;

    var s,
        verFile = cfg.getVerFile(),
        oldVerReg = new RegExp(v, 'g');
    s = fs.readFileSync(verFile, {encoding: 'utf8'});
    s = s.replace(oldVerReg, newVer);
    fs.writeFileSync(verFile, s); // 更新页面配置文件中的版本号

    cfg.serNewVer(newVer); // 更新配置模块中版本号

    if(!fs.existsSync("release/" + newVer)){ // 生成新版本文件夹
        fs.mkdirSync("release/" + newVer);
    }
}
