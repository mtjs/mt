/**
 * Created by .
 * User: waynelu
 * Date: 13-8-30
 * Time: 上午11:27
 * 增量模式的方式加载js
 */
var storeIncLoad= (function () {
    //是否用本地存储，是否增量更新，本次版本号，是否debug状态，如果是debug状态默认走原文方式
    var storeInc={'store':false,'inc':false,'jsver':'2013083001001','debug':true,proxy:false,statFunc:function(jsUrl,mode){
        console.log('get '+jsUrl+' from '+mode);
    },storeExFunc:function(storeKey){console.log('set store item '+storeKey+' exception')}};
    var init=function(o){
        storeInc=o;
    };
    //根据url获取url的本地存储地址
    /**
     *
     * @param url
     * @param jsver
     * @returns {string}
     */
    var getStoreKey = function (url,jsver){
        var keyArr=new Array();
        var pathArr = url.split('/');
        for(var i=0;i<pathArr.length;i++){
            if(jsver!=pathArr[i]){
                keyArr.push(pathArr[i]);
            }
        }
        return keyArr.join('/');
    };
    //修改新的js 判断本地存储的方法。
    var isLocalStorageNameSupported =function () {
        try {
            var supported = ('localStorage' in window && window['localStorage']);
            if (supported) {
                localStorage.setItem("storage", "");
                localStorage.removeItem("storage");
            }
            return supported;
        }
        catch(err) {

            if(storeInc.storeExFunc&&'QuotaExceededError'==err.name){
                storeInc.storeExFunc("isLocalStorageNameSupportederr");
            }
            return false
        }
    };
    //根据参数和执行情况
    var loadScript = function (urls, verArr, buildType, scriptCall,jsPath,callback) {
       // console.log(urls);
        //console.log(verArr);
        //console.log(jsPath);
        //如果是走本地存储，且支持本地存储，并且非debug模式下
        if(storeInc.store&&isLocalStorageNameSupported()&&!storeInc.debug){
            var storeMap={};
            var jsCodeMap={};
            var lastverMap={};
            var isExcept=false;
            var eUrlArr=[];
            var verMap={};
            for(var i=0;i<urls.length;i++){
                var url=jsPath+urls[i];
                var extUrl=urls[i];
                var ver=verArr[i];
                var storeKey = buildType === 'project' ? getStoreKey(url, ver) : url;
                var lastverStr='999';
                var jsCode=null;
                //对读取本地存储加异常处理
                try{
                    jsCode = localStorage.getItem(storeKey);
                    lastverStr = localStorage.getItem(storeKey + "?ver") || '999';
                }
                catch(ex){
                    //如果异常则走script方式
                    var realUrlx=storeInc.debug?url:urlParse(url,ver,-10,false,buildType);
                    scriptCall&&scriptCall(realUrlx, callback,true);
                    isExcept=true;
                    continue;
                }
                //获取上一个版本
                var lastver = lastverStr ? parseInt(lastverStr) : -10;
                //获取本地版本
                var jsver = parseInt(ver);

                //如果版本没有更新且本地有js内容，则直接eval
                if(jsCode && lastver == jsver && !storeInc.debug){
                    globalEval(jsCode);
                    callback&&callback();
                    if(storeInc.statFunc){
                        storeInc.statFunc(url,'local');
                    }
                } else {
                    //根据版本判断是不是可以增量更新，mtbuid方式的话版本后3位加1的话会，
                    // 如果是servlet proxy方式下则只要本地有上个版本就会走
                    var inc = (storeInc.inc && canInc(lastverStr, ver) && jsCode) ? true : false;
                    //拼凑jsurl真是地址
                    var realExtUrl = urlParse(extUrl, ver, lastver, inc, buildType);
                    storeMap[realExtUrl]=storeKey;
                    jsCodeMap[realExtUrl]=jsCode;
                    lastverMap[realExtUrl]=lastverStr;
                    verMap[realExtUrl]=ver;
                    eUrlArr.push(realExtUrl);
                }

            }
            if(isExcept) return isExcept;
            if(eUrlArr.length>0){
                //根据url用ajax去请求js内容
                var eRealUrl=jsPath+','+eUrlArr.join(',');
                //console.log("xxxxxx:"+eRealUrl);
                try{
                    xhr(eRealUrl,function(dataTxt){
                         var dataArray=JSON.parse(dataTxt);
                        //如果是增量更新模式，取回数据跟现有数据合并成新的js内容
                        for(var i=0;i<dataArray.length;i++){
                            var data=dataArray[i];
                            var rUrl=jsPath+data.js;

                            jsCode=jsCodeMap[data.js];
                            storeKey=storeMap[data.js];

                            ver=verMap[data.js];
                            if(data.inc){
                               // var incData= JSON.parse(data);
                                var checksumcode=data.data;
                                var diffAlg=data.diffAlg;

                                jsCode=data.modify?mergejs(jsCode,data.chunkSize,checksumcode,diffAlg):jsCode;
                               // alert(jsCode);
                                //统计回调
                                if(storeInc.statFunc){
                                    storeInc.statFunc(rUrl,'inc');
                                }
                                //:function(jsUrl,mode)
                            }else{
                                //统计回调
                                if(storeInc.statFunc){
                                    storeInc.statFunc(rUrl,'full');
                                }
                                //全量模式
                                jsCode=data.data;
                            }
                            try{
                                // console.log(jsCode);
                                //eval js代码，执行回调,写入本地存储
                                globalEval(jsCode);
                                callback && callback();
                                localStorage.setItem(storeKey,jsCode);
                                localStorage.setItem(storeKey+"?ver",ver);
                            }catch(e){
                                //如果有异常，删除本地存储
                                console.log(e);
                                localStorage.removeItem(storeKey);
                                localStorage.removeItem(storeKey+"?ver");
                                //如果定义了本地存储异常回调函数，则调用回调函数,可以用来清理本地存储
                                if(storeInc.storeExFunc){
                                    storeInc.storeExFunc(storeKey);
                                }
                            }
                        }

                    });
                }
                    //如果有异常调用script方式载入js
                catch(ex){
                    scriptCall&&scriptCall( realUrl, callback,true);
                    //统计回调
                    if(storeInc.statFunc){
                        storeInc.statFunc(url,'full');
                    }
                    return true;
                }
            }
            return true;



        }else{
            //非本地存储方式
            for(var i=0;i<urls.length;i++){
                var url=jsPath+urls[i];
                var ver=verArr[i];
                var realUrl=storeInc.debug?url:urlParse(url,ver,-10,false,buildType);
                console.log(realUrl+" "+url);
                scriptCall&&scriptCall(realUrl, callback,true);
                //统计回调
                if(storeInc.statFunc){
                    storeInc.statFunc(url,'full');
                }
            }
            return true;
        }
        return false;
    }
    /**
     *  版本号码最后3位是不是相差1，如果走servlet proxy方式则肯定返回ture
     * @param lastver
     * @param jsver
     * @returns {boolean}
     */
    function canInc(lastver,jsver){
        if(storeInc.proxy){
            return true;
        }
        // build 方式转换测试
        var plva = (lastver.toString()).length === 13;
        var pnva = (jsver.toString()).length === 13;
        if(plva !== pnva) return false;

        var incver=parseInt(jsver.substr(jsver.length-3,3));
        var incOldVer=-10;
        if(lastver){
            incOldVer=parseInt(lastver.substr(lastver.length-3,3));
        }
        return incver-incOldVer != 1 ? false : true;

    }
    // 获取js地址js地址
    // 上个版本号，本次版本号,xxx.01-03.js
    function urlParse(url, ver, lastver, inc, buildType){
        if(buildType === 'file') {
            var prefix = '';
            if(lastver < 10) {
                prefix = '00';
            }else if(lastver < 100) {
                prefix = '0';
            }
            lastver = prefix + lastver;
        }

        return inc ? url.replace(".js","-"+lastver+"_"+ver+".js") :
            url.replace(".js","-"+ver+".js");
    }
    //根据旧数据和增量数据合成新js内容
    function mergejs(source,trunkSize,checksumcode,diffAlg){
        if(diffAlg=='lcs'){
            return  mergeLcs(source,checksumcode);
        }
        else{
            return  mergeChunk(source,trunkSize,checksumcode);
        }

    }
    function mergeChunk(source,trunkSize,checksumcode){
        var strResult="";
        for(var i=0;i<checksumcode.length;i++){
            var code=checksumcode[i];
            if(typeof (code)=='string'){
                strResult+=code;
            }
            else{
                var start=code[0]*trunkSize;
                var end=code[1]*trunkSize;
                var oldcode=source.substr(start,end);
                strResult+=oldcode;
            }
        }

        return strResult;
    }
    function mergeLcs(src,diff){
        var strBuffer='';
        for(var i=0;i<diff.length;i++){
            var item=diff[i];
            if(typeof(item)=='string'){
                strBuffer=strBuffer+item;
            }
            else{
                strBuffer=strBuffer+src.substr(item[0]-1,item[1]);
            }
        }
        return strBuffer;

    }

    //ajax 获取js内容，服务器需要指出跨域
    function xhr(url, callback) {
        // var r = window.ActiveXObject ? new window.ActiveXObject('Microsoft.XMLHTTP'): new window.XMLHttpRequest()
        var r = new window.XMLHttpRequest()
        r.open('GET', url, true)
        r.onreadystatechange = function() {
            if (r.readyState === 4) {
                if (r.status === 200) {
                    callback(r.responseText)
            }
                else {
                    throw new Error('Could not load: ' + url + ', status = ' + r.status)
                }
            }
        }
        return r.send(null)
    }
    //eval js
    function globalEval(data) {
        if (data && /\S/.test(data)) {
            // (window.execScript || function(data) {
            window['eval'].call(window, data)
            // })(data)
        }
    }
    return {
        'loadScript':loadScript,
        'xhr':xhr,
        'init':init
    }
})();


(function () {
    var oldconfig = MT.config;
    console.log('updateScriptloader');
    MT.config = function (conf) {
        MT.conf = conf;
        storeIncLoad.init(conf.storeInc);
        oldconfig && oldconfig(conf);
    };

    // 升级MT的scriptloader
    MT.updateScriptLoader(function (url, cb, orgloader) {

        var filePath, jsPath,fs, buildType;
        var verArr=[];
        var realPath=[];
        var config = MT.conf;
        var cs, css;
        var splitIndex=url.indexOf(',');
        var urlStr=url.substr(splitIndex+1);
        var urlArray=urlStr.split(',');
//        for(var i=0;i<urlArray.length;i++){
//          console.log(urlArray);
//        }

        if(config.testEnv) {
            console.log('testEnv '+url);
            orgloader(url, cb);
        }else{
            for(var i=0;i<urlArray.length;i++){
                var sUrl=urlArray[i];
                // 判断版本类型 完整加载路径 page可默认
                filePath =sUrl;// config.jsmap[name] || (config.jspath + name + '.js');
                jsPath =config.serverDomain+ config.staticPath;
                var ver=config.ver;
                fs = filePath.split('?');
                buildType = config.buildType;
                if(buildType === 'project') {
                    jsPath = jsPath + '/' + ver;

                } else {
                    if(fs.length === 1) {
                        ver = '001';
                        for(cs in config.jsmap) {
                            if(config.jsmap[cs].indexOf(fs[0]) === 0){
                                css = config.jsmap[cs].split('?');
                                if(css.length === 2) {
                                    ver = css[1];
                                }
                            }
                        }
                    } else {
                        ver = fs[1];
                    }
                }
                verArr.push(ver);
                realPath.push("/"+fs[0]);
            }

            storeIncLoad.loadScript(realPath, verArr, buildType, orgloader,jsPath);
        }
    });
})();