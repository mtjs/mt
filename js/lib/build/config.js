var fs = require('fs'),
    util = require('./util.js'),
    logger = util.logger,
    diffAlg='lcs',
    confFile,
    buildFile,
    tempFolder,
    newVer;

// 读取配置信息
exports.readConfig = function() {
    var argvs = process.argv;

    confFile = argvs[2],
    buildFile = argvs[3],
    diffAlg=argvs[4];
    tempFolder = argvs[1].replace(/[^\\]*$/, '_tmp');

    logger.info('页面文件配置位置：' + confFile);
    logger.info('build 配置位置：' + buildFile);

    if (fs.existsSync(tempFolder)) { // clear old files
        util.clearDir(tempFolder);
    }else {
        fs.mkdirSync(tempFolder);
    }
};

exports.getFileConfig = function() { // 获取文件配置
    return readHtmlConf(confFile);
};
exports.getBuildConfig = function() { // 获取 build 配置
    return readJsonConf(buildFile);
};
exports.getTempFolder = function() { // 获取临时文件目录
    return tempFolder;
};
exports.getVerFile = function() {
    return confFile;
};
exports.serNewVer = function(v) { // 设置新版本
    newVer = v;
};
exports.getNewVer = function() { // 获取新版本
    return newVer;
}
exports.getDiffAlg= function() { // 获取算法
    return diffAlg;
}

function toJson(str) {
    return new Function('return (' + str +')')();
};

// 读取页面配置
var readHtmlConf = function(file) {
    var txt = fs.readFileSync(file, {
        encoding: 'utf8'
    });
    var reg = /\<script type\=\"text\/javascript\" id\=\"file_config\"\>([\s\S]+?)\<\/script\>/; // 页面约定 id="file_config"
    var result = txt.match(reg);
    var jsCode = result[1];
    eval(jsCode);
    return g_config; // 约定配置变量 g_config
};
exports.readHtmlConf = readHtmlConf;

// 读取 build 配置
function readJsonConf(file) {
    var txt = fs.readFileSync(file, {
        encoding: 'utf8'
    });
    if (!txt) {
        txt = '{}';
    }
    return toJson(txt);
};