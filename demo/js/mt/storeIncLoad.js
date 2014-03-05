/**
 * Created by .
 * User: waynelu
 * Date: 13-8-30
 * Time: 上午11:27
 * 增量模式的方式加载js
 */
var storeIncLoad= (function () {
    //是否用本地存储，是否增量更新，本次版本号，是否debug状态，如果是debug状态默认走原文方式
    var storeInc={'store':false,'inc':false,'jsver':'2013083001001','debug':true,proxy:false};
    var init=function(o){
        storeInc=o;
    };
    //根据url获取url的本地存储地址
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
        catch(err) { return false }
    };
    //根据参数和执行情况
    var loadScript = function (url, ver, buildType, scriptCall, callback) {
        console.log('loadScript:'+url);
        //如果是走本地存储，且支持本地存储，并且非debug模式下
        if(storeInc.store&&isLocalStorageNameSupported()&&!storeInc.debug){
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
                scriptCall&&scriptCall(realUrlx, callback);
                return true;
            }
            //获取上一个版本
            var lastver = lastverStr ? parseInt(lastverStr) : -10;
            //获取本地版本
            var jsver = parseInt(ver);
          //根据版本判断是不是可以增量更新，mtbuid方式的话版本后3位加1的话会，
          // 如果是servlet proxy方式下则只要本地有上个版本就会走
            var inc = (storeInc.inc && canInc(lastverStr, ver) && jsCode) ? true : false;
            //拼凑jsurl真是地址
            var realUrl = urlParse(url, ver, lastver, inc, buildType);
            //如果版本没有更新且本地有js内容，则直接eval
            if(jsCode && lastver == jsver && !storeInc.debug){
                globalEval(jsCode);
                callback&&callback();
            } else {
                //根据url用ajax去请求js内容
                try{
                    xhr(realUrl,function(data){
                        //如果是增量更新模式，取回数据跟现有数据合并成新的js内容
                        if(inc){
                            var incData= JSON.parse(data);
                            var checksumcode=incData.data;
                            jsCode=incData.modify?mergejs(jsCode,incData.chunkSize,checksumcode):jsCode;
                        }else{
                            //全量模式
                            jsCode=data;
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
                        }
                    });
                }
                //如果有异常调用script方式载入js
                catch(ex){
                    scriptCall&&scriptCall( realUrl, callback);
                    return true;
                }
            }
        }else{
            //非本地存储方式
            var realUrl=storeInc.debug?url:urlParse(url,ver,-10,false,buildType);
            scriptCall&&scriptCall(realUrl, callback);
            return true;
        }
        return false;
    }
    //版本号码最后3位是不是相差1，如果走servlet proxy方式则肯定返回ture
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
    function mergejs(source,trunkSize,checksumcode){
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
   //ajax 获取js内容，服务器需要指出跨域
    function xhr(url, callback) {
        var r = window.ActiveXObject ? new window.ActiveXObject('Microsoft.XMLHTTP'): new window.XMLHttpRequest()
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
            (window.execScript || function(data) {
                window['eval'].call(window, data)
            })(data)
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

		var filePath, jsPath, ver, fs, buildType, realPath;
		var config = MT.conf;
		var cs, css;
		if(config.testEnv) {
			orgloader(url, cb);
		}else{
            console.log(url);
			// 判断版本类型 完整加载路径 page可默认
			filePath =url;// config.jsmap[name] || (config.jspath + name + '.js');
			jsPath =config.serverDomain+ config.staticPath;
			ver = config.ver;
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
			realPath = jsPath + "/"+fs[0];

			storeIncLoad.loadScript(realPath, ver, buildType, orgloader);
		}
	});
})();