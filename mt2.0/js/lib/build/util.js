var fs = require('fs'),
    colors = require('colors'),
    cliTable = require('cli-table'),
    blTable = false;

// 获取文件信息
exports.getFileInfo = function(path) {
    var pathArr = path.split('/');
    var name = pathArr.pop();
    var namearr = name.split('.');
    var extName = namearr.pop();
    var fileName = namearr.join('.');
    var filePath = pathArr.join('/');
    var verArr=fileName.split('-');
    var ver=verArr.pop();
    return {
        filePath: filePath || '.',
        fileName: fileName,
        extName: extName,
        ver:ver,
        fullName: fileName + '.' + extName
    };
};

// 打印 build 日志表格
exports.logBuildList = function(item) {
    if(!blTable) {
        blTable = new cliTable({
            head: ['Target File', 'Combo Files', 'Result', 'IncResult']
            , chars: {
                'top': '-'
                , 'top-mid': '-'
                , 'top-left': '-'
                , 'top-right': '-'
                , 'bottom': '-'
                , 'bottom-mid': '-'
                , 'bottom-left': '-'
                , 'bottom-right': '-'
                , 'left': '|'
                , 'left-mid': '|'
                , 'mid': '-'
                , 'mid-mid': '-'
                , 'right': '|'
                , 'right-mid': '-'
            }
            , colWidths: [40, 40, 10, 20]
        });
    }
    blTable.push(item);
};
// 结束打印
exports.endLogBuildList = function() {
    if(blTable) {
        console.log('');
        console.log(blTable.toString());
        console.log('');
        blTable = false;
    }
};

// 删除文件夹及内容
var clearDir = function(dir) {
    var dirList = fs.readdirSync(dir), p, isD;
    dirList.forEach(function(item){
        p = dir + '/' + item;
        isD = (fs.statSync(p)).isDirectory();
        if(isD) { // 判断是文件夹 进行递归 clear
            clearDir(p);
            fs.rmdirSync(p);
        } else {
            fs.unlinkSync(p);
        }
    });
};
exports.clearDir = clearDir;

// 深拷贝目录
var copyDir = function(sd, dd) {
    var dirList = fs.readdirSync(sd), sp, dp, isD;
    dirList.forEach(function(item){
        sp = sd + '/' + item;
        dp = dd + '/' + item;
        isD = (fs.statSync(sp)).isDirectory();
        if(isD) { // 判断是文件夹 进行递归 copy
            fs.mkdirSync(dp);
            copyDir(sp, dp);
        } else {
            fs.linkSync(sp, dp);
        }
    });
};
exports.copyDir = copyDir;

// 日志工具
var logger = {
    vip: function(s) { // 重要信息
        console.log('\n' + s.bold + '\n');
    },
    err: function(s) { // 错误
        console.log(s.red);
    },
    warn: function(s) { // 警告
        console.log(s.yellow);
    },
    info: function(s) { // 普通信息
        console.log(s);
    }
};
exports.logger = logger;

// 空位补 0
var fixZero = function(n, l) {
    var i;
    var z = '';
    l = Math.max(('' + n).length, l);
    for (i = 0; i < l; i++) {
        z += '0';
    }
    z += n;
    return z.slice(-1 * l);
}
exports.fixZero = fixZero;

