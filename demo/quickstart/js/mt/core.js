/**
 * Created by .
 * User: markshang,waynelu
 * Date: 13-4-25
 * Time: 下午 16:38
 * AMD模块管理实现
 */
(function () {
    var global = this;
    var core = function () {
        // 存储模块的map
        var map = {};
        // 用于保存待检查模块的队列
        var que = [];
        // 存储每个模块创建完成后回调的map
        var cbMap = {};
        // 用户自定义的模块和路径对应关系
        var jsMap = {};
        // 记录加载过的js 防止重新加载
        var scriptUrlMap = {};
        var path = './js/';
        var combo={cb:false,conf:''};
        var coreJsUrl = '';
        // 设置js路径
        var setJsPath = function (a) {
            a&& (path = a);
        };
        // 设置自定义模块和路径对应关系
        var setJsMap = function (map) {
            jsMap = map;
        };
        var setCombo=function(cb){
            cb&&(combo=cb);
        };
        var each = function (arr, cb) {
            var i,
                n = (arr || []).length;
            for (i = 0; i < n; i++) {
                cb(arr[i]);
            }
        };
        var getMods = function (req) {
            var mods = [];
            each(req, function (name) {
                mods.push(map[name]);
            });
            return mods;
        };
        var reg = function (name, req, fn) {
            var item = {
                name : name,
                req : req,
                fn : fn
            };
            if (map[name]) {
                throw 'module ' + name + ' exists!';
            }
            checkMod(item);
        };
        var allexists = function (arr) {
            var flag = true;
            each(arr, function (name) {
                !map[name] && (flag = false);
            });
            return flag;
        };
        // 检查是否要创建模块
        var checkMod = function (item) {
            var cb;
            // 依赖条件都满足后就直接创建 否则放入队列等候
            if (allexists(item.req)) {
                map[item.name] = item.fn.apply(null, getMods(item.req)) || {};
                map[item.name].__name__ = item.name;
                cb = cbMap[item.name];
                cb && (delete cbMap[item.name], cb(map[item.name]));
                checkque();
            } else {
                que.push(item);
                if(!combo.cb) {
                    setTimeout(function () {
                        each(item.req, load)
                    }, 0);
                }
                else{
                    comboLoad(item.req);
                }
            }
        };

        // 检查队列中等候的模块是否可以创建
        var checkque = function () {
            var item;
            var i = 0,
                n = que.length;
            for (i = 0; i < n; i++) {
                item = que.shift();
                item && checkMod(item);
            }
        };
        //combo加载js
        var comboLoad=function(reqArray){
            var reqArray=  filterReq(reqArray);
            //console.log('combo after:'+reqArray.join(','));
            load(reqArray);
        };

        /*
        过滤掉已经下载的js
         */
        var filterReq=function(reqArray){
            var resultReq=[];
            each(reqArray, function (itm) {
                 if(!isScriptLoaded(itm)) {
                     resultReq.push(itm);
                 }
            });
            return resultReq;
        } ;
        var isArray=function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
        // 加载指定模块
        var load = function (jsNames, cb) {
            //如果是一个数组
            if(isArray(jsNames)){
                //如果设置了combo.conf则读取一起加载的模块一起加载
                var tArr=[];
                if(combo.cb&&combo.conf&&combo.conf.length>0){
                    for(var j=0;j<combo.conf.length;j++){
                        var comboArray=combo.conf[j].split(',');
                        for(var x=0;x<comboArray.length;x++){
                            for(var i=0;i<jsNames.length;i++){
                                var name=jsNames[i];
                                if(name==comboArray[x]){
                                    tArr=tArr.concat(comboArray);
                                }

                            }
                        }
                    }
                }
                jsNames=jsNames.concat(tArr);
                //console.log(tArr);
                for(var i=0;i<jsNames.length;i++){
                    var name=jsNames[i];
                    if (map[name]) {
                        cb && cb(map[name]);
                        continue;
                    }
                    if(isScriptLoaded(name)) continue;
                    scriptUrlMap[name] = true;
                    scriptUrlMap[jsMap[name]] = true;
                    (typeof cb == 'function') && (cbMap[name] = cb);
                    //如果不支持combo
                    if(!combo.cb){
                        getLoader()(jsMap[name]|| (path + name + '.js'));
                    }
                }
                if(combo.cb){
                    var comboJs=getComboJsName(jsNames);
                    if(comboJs){
                        comboJs=','+ comboJs;
                        getLoader()(comboJs || (path + comboJs + '.js'));
                    }
                }


            }
            else{
                load([jsNames],cb);
                return;
            }
        };
        //获取combojs名称
        var getComboJsName=function(jsNames){
            var realJs=[];
            var realMap={};
            each(jsNames,function(name){
                var js=jsMap[name];
                if(!realMap[js]){
                    realJs.push(js);
                    realMap[js]=true;
                }
            });
            return realJs.length==1?realJs[0]:realJs.join(',');
        }
        // 判断模块对应的js是否正在加载
        var isScriptLoaded = function (name) {
            if (map[name]) return true;
            var f = jsMap[name];
            var flag = false;
            var scripts = document.getElementsByTagName('script');
            if(scriptUrlMap[name]||scriptUrlMap[f]) {
                flag = true;
            }
            each(scripts, function (itm) {
                var srcUrl=itm.src;
                if(srcUrl == f||isJsloadByCombo(f,srcUrl)) {
                    flag = true;
                }
            });

            return flag;
        };
        //判断某个js是否被combo下载过
        var isJsloadByCombo=function(name,src){
            var arr=src.split('/').pop();
            var jsArray=arr.split(',');
            each(jsArray, function (itm) {

                  if(itm==name){
                      return true;
                  }
            });
            return false;
        }
        //真正加载js
        var loadScript = function (url, cb,isStoreLoad) {
            if(!isStoreLoad){

                url=path+"/"+url;
               // console.log(path+'not store '+url);
            }
            console.log(url);
            var script;
            script = document.createElement('script');
            script.async = true;
            script.onload = cb;
            script.src = url;
            document.head.appendChild(script);
        };
        var getLoader = function () {
            return loadScript;
        };
        var unreg = function (name, fn) {
            delete map[name];
        };
        var getMod = function (name) {
            return map[name];
        };
        var init = function (conf) {
            conf.staticPath && setJsPath(conf.staticPath);
            conf.jsmap && setJsMap(conf.jsmap);
            conf.combo && setCombo(conf.combo);
        };
        var updateLoader = function (loader) {
            var orgloader = loadScript;
            (typeof loader == 'function') && (loadScript = function (url, cb){loader(url, cb, orgloader)});
        };
        return {
            define : reg,
            undefine : unreg,
            setPath : setJsPath,
            setMap : setJsMap,
            require : load,
            updateLoader: updateLoader,
            loadScript : loadScript,
            init: init
        }
    }();
    define = core.define;
    require = core.require;
    global.MT = global.MT || {};

    /*
     设置 参数格式 
    {
         jspath: 'xx', // js路径
         jsMap: {
             'a': '../js/a.js' //模块名与路径对应关系
         }
     }
    */
    global.MT.updateScriptLoader = function (loader) {
        core.updateLoader(loader);
    };
    var oldconfig = MT.config;
    global.MT.config = function (conf) {
        global.MT.conf = conf;
        core.init(conf);
        oldconfig && oldconfig(conf);
    };
})();