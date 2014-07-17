#!/usr/bin/env node
var fs = require('fs'),
    cfg = require('./lib/build/config.js');
var logger = require('./lib/build/util.js').logger;

global.ROOT_PATH = __dirname;

logger.vip('启动 build 程序：');

logger.info('读取配置文件...');
cfg.readConfig();

// 创建 release 文件夹
if(!fs.existsSync("release")){
    fs.mkdirSync("release");
}

var fileConfig = cfg.getFileConfig(); // 页面配置
var buildConfig = cfg.getBuildConfig(); // build 配置
var buildType = fileConfig.buildType; // build 类型

if(buildType !== 'project' && buildType !== 'file') logger.err('构建类型错误 请填写 project 或 file');

logger.info('构建类型:' + buildType);

// 根据类型 执行 build
if(buildType === 'project') {
    require('./lib/build/build_project.js').build(buildConfig);
} else {
    require('./lib/build/build_files.js').build(buildConfig);
}






