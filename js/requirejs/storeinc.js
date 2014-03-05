/**
/**
 * Created by .
 * User: waynelu
 * Date: 13-8-30
 * Time: 上午11:27
 * 增量模式的方式加载js
 */

(function () {
var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
    hasLocalStorage = (function(){
      var supported = false;
      try{
        supported = window && ("localStorage" in window) && ("getItem" in localStorage);
      }catch(e){}
      return supported;
    })();
define(function () {
  var storeinc = {
        //根据url获取url的本地存储地址
    createXhr: function () {
      //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
      var xhr, i, progId;
      if (typeof XMLHttpRequest !== "undefined") {
        return new XMLHttpRequest();
      } else {
        for (i = 0; i < 3; i++) {
          progId = progIds[i];

          try {
            xhr = new ActiveXObject(progId);
          } catch (e) {}

          if (xhr) {
            progIds = [progId];  // so faster next time
            break;
          }
        }
      }

      if (!xhr) {
        throw new Error("createXhr(): XMLHttpRequest not available");
      }

      return xhr;
    },

    get: function (url, callback) {
      var xhr = storeinc.createXhr();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function (evt) {
        if (xhr.readyState === 4) {
          callback(xhr.responseText);
        }
      };
      xhr.send(null);
    },
    //版本号码最后3位是不是相差1
    canInc:function (lastver,jsver,config){
        if(config.storeproxy&&lastver!=="-1"){
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
    },
    // 获取js地址js地址
    // 上个版本号，本次版本号,xxx.01-03.js
    urlParse:function (url, ver, lastver, inc){
        console.log(url+' '+ver+' '+lastver+''+true);
        return inc ? url.replace(".js","-"+lastver+"_"+ver+".js") :
            url.replace(".js","-"+ver+".js");
    },
    //合并成新的js
    mergejs:function (source,trunkSize,checksumcode){
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
    },

    load: function (name, req, load, config) {
      var jsCode, url = req.toUrl(name)+".js";
      var storeKey=url;
      url=url.replace(config.baseUrl,config.baseUrl+config.ver+"/");
      
      if (hasLocalStorage) { 
        var lastverStr=localStorage.getItem(storeKey+'?ver')||'-1';
        var lastver = lastverStr ? parseInt(lastverStr) : -10;
        var jsver = parseInt(config.ver);
        jsCode = localStorage.getItem(storeKey);

        var inc = (storeinc.canInc(lastverStr, config.ver,config) && jsCode) ? true : false;
        var realUrl = storeinc.urlParse(url, config.ver, lastver, inc);

         
        if (jsCode && lastver == jsver) {
          load.fromText(name,jsCode);
        } else {
          storeinc.get(realUrl, function (content) {
            if(inc){
                var incData= JSON.parse(content);
                var checksumcode=incData.data;
                jsCode=incData.modify?storeinc.mergejs(jsCode,incData.chunkSize,checksumcode):jsCode;
            }else{
                jsCode=content;
            }
            load.fromText(name, jsCode);
            req([name], function (jsCode) {
              load(jsCode);
            });
            try { 
              localStorage.setItem(storeKey, jsCode);
              localStorage.setItem(storeKey+'?ver', config.ver);

            } catch(e) {}
          });

          return;
        }
      }
      req([name], function (content) {
        load(content);
      });
    }
  };

  return storeinc;
});

}());
