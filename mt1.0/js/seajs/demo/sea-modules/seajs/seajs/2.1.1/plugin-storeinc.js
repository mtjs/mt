/**
 * The store inc pluin
 */
define('plugin-storeinc', [], function(require, exports) {
 // var pluginSDK = seajs.pluginSDK
  //var util = pluginSDK.util
 // var config = pluginSDK.config
  //var Module =seajs.Module
 // var cachedModules = seajs.cache
     var storeInc={'store':true,'inc':true,'jsver':'1.0.0',aliasver:'1.0.0','debug':false};
  //var storeInc={}
  exports.configStroreInc= function(o) {
      console.log('config store');
        storeInc=o;
  }
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
     //获取js地址js地址，上个版本号，本次版本号,xxx.01-03.js
  function urlParse(url,ver,lastver,inc){
	  if(isAlia(url)){return url};
      return inc?url.replace(".js","-"+lastver+"_"+ver+".js"):url.replace(".js","-"+ver+".js");
  }
  //是不是别名
  function isAlia(url){
	var urlarr = url.split('/');
	var name=urlarr.pop();
	var idArr=name.split('.');
	var id=idArr[0];
	console.log(id);
    return seajs.data.alias[id]?true:false;
  }
  //两个版本之间是不是只差1
  function incOne(lastver,ver,url){
	if(lastver=='0.0.0'||isAlia(url)){return false};
	var lastverarr = lastver.split('.');
	var lastVerMin=parseInt(lastverarr.pop());
	var verarr = ver.split('.');
	var verMin= parseInt(verarr.pop());
	return verMin-lastVerMin==1?true:false;
  }
    //根据url获取url的本地存储地址
 function getStoreKey(url,jsver){
    var keyArr=new Array();
	var pathArr = url.split('/');
    for(var i=0;i<pathArr.length;i++){
        if(jsver!=pathArr[i]){
            keyArr.push(pathArr[i]);
        }
    }
    return keyArr.join('/');
};

  function hackFetch() {

	 seajs.on("request", function(seadata) {
	    var IS_CSS_RE = /\.css(?:\?|$)/i
        var isCSS = IS_CSS_RE.test(url)
		var url =seadata.requestUri;
		if(isCSS){
			return;
		}
        else{
                if(storeInc.store&&('localStorage' in window)&&!storeInc.debug){
                   //

				    var jsver=storeInc.jsver;
                    //别名走自己的版本号
                    if(isAlia(url)){jsver=storeInc.aliasver};
                    var storeKey= getStoreKey(url,jsver);
                    var lastverStr=localStorage.getItem(storeKey+"?ver");
                    var  jsCode= localStorage.getItem(storeKey);
                    var lastver=lastverStr?lastverStr:"0.0.0";
                    //小版本间隔为1才可以增量更新
                    var inc=(storeInc.inc&&incOne(lastver,jsver,url)&&jsCode)?true:false;
                    var realUrl=urlParse(url,jsver,lastver,inc);

                    seadata.requestUri=realUrl;
                    if(jsCode&&lastver==jsver){
                        console.log('local '+url);
                        globalEval(jsCode);
						seadata.requested = true;
                        seadata.onRequest();
                    }
                    else{
                        try{
							seadata.requested = true;
                            xhr(realUrl,function(data){
                                if(inc){
                                    var incData= JSON.parse(data);
                                    var checksumcode=incData.data;
                                    jsCode=incData.modify?mergejs(jsCode,incData.chunkSize,checksumcode):jsCode;
                                }
                                else{
                                    jsCode=data;
                                }
                                try{
                                    globalEval(jsCode);
                                    localStorage.setItem(storeKey,jsCode);
                                    localStorage.setItem(storeKey+"?ver",jsver);
                                }
                                catch(e){
                                     localStorage.removeItem(storeKey);
                                     localStorage.removeItem(storeKey+"?ver");
                                }
						          seadata.onRequest();
                            });
                         }
                        catch(ex){
                           // seadata.onRequest();
                            seadata.requested =false;
                            console.log('error module fetch '+url);
                            // _fetch.call(this, realUrl, callback, charset);
                        }
                    }
                }
               else{
                   var realUrl=storeInc.debug?url:urlParse(url,storeInc.jsver,"0.0.0",false);
                    seadata.requestUri=realUrl;
                    seadata.requested =false;
                   console.log('module fetch '+realUrl);
                //  _fetch.call(this, realUrl, callback, charset);
                  //  seadata.onRequest();
                }
		}
	//	if (name) {
		//  xhr(data.requestUri, function(content) {
		//	data.onRequest()
		//  })


		//}
	  })

    console.log('hackFetch ');
  }



  // No combo in debug mode
  if (seajs.debug) {
    seajs.log('is debug ,so do not hack')
  } else {
    hackFetch()
  }

  function xhr(url, callback) {
    var r = window.ActiveXObject ?
        new window.ActiveXObject('Microsoft.XMLHTTP')
        : new window.XMLHttpRequest()

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


  function globalEval(data) {
    if (data && /\S/.test(data)) {
      (window.execScript || function(data) {
        window['eval'].call(window, data)
      })(data)
    }
  }
})

// Runs it immediately
seajs.use('plugin-storeinc');

