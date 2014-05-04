/**
 * Created by .
 * 依赖core.js和storeIncLoad.js
 * User: waynelu
 * Date: 13-9-2
 * Time: 上午9:45
 * To change this template use File | Settings | File Templates.
 */

define('pm', ['jqmobi'], function ($) {
      console.log('pm init ');
        var extend = $.extend;
        var PM={version:"1.0",name:"pagemanager"};
        var hashControl = function () {
        var preSearch="";
        var prevHash = "";
        var curHash = "";
        var curPage = "";
        var prevPage = "";
        var curMod = null;
        var homePage = "";
        var pageList = {};
		var visiteLog = [];
        //外部接口，初始化
        function init(opt) {
            var hashParas;
            homePage = opt.home;
           // jsver=opt.jsver;
            //store=opt.store;
			//istest=opt.test;
          //  inc=opt.inc
			//islog=opt.islog;
			//reportUrl=opt.reportHost;
      
            if ("onhashchange" in window) {
                window.addEventListener("hashchange",_onHashChange, false);
            } else {
                console.log('not support onhashchange');
            }

            hashParas = getHashParams();
            if (hashParas.__vpageid) {
                _loadPage();
            }else {
                go(homePage);
            }

			if ("onpopstate" in window) {
                   window.addEventListener("popstate",_onPopState, false);
            }
            else{
                console.log('not support onpopstate');
            }
        }
		//对外接口，跳转到page
		function  go(page) {
			window.location.hash = page;
		}
	  //打增量更新耗时log
	// function log(js,inc,nettime,lsTime,mergeTime){
	//	  if(islog){
	//		var url=reportUrl+'s?aid=lslog&js='+js+'&inc='+inc+'&netTime='+nettime+'&lsTime='+lsTime+'&mergeTime='+mergeTime;
	//		xhr(url,function(){});
	//	  }
	//  }
		function strToObj(str, type) {
			var paramArray = [];
			var paramObj = {};
			var i,a,len;

			paramArray = str.split("&");
			len = paramArray.length;
			for (i = 0; i < len; i++) {
				if (paramArray[i].indexOf("=") < 0) {
					paramObj[paramArray[i]] = undefined;
					continue
				}
				a = paramArray[i].split("=");
				paramObj[a[0]] = type ? decodeURIComponent(a[1]) : a[1];
			}
			return paramObj;
		}

		function getHashParams(str){
			var hash = str ? str : decodeURIComponent(location.hash),
			hashArr = [],
			obj = {};
			//过滤非法字符
			hash.replace(/[\.\?'"><:;,\[\]\{\}]/ig, '');
			hashArr = hash.split("\/");
			if (hashArr.length > 0) {
				obj["__vpageid"] = hashArr.splice(0,1)[0].substring(1);
				obj["urlParams"] = (hashArr.length > 0) ? strToObj(hashArr.join('/'), true) : {};
			}
			return obj;
		}
        //设置当前参数
        function _setCurPage() {
            var hashObj = getHashParams();
            prevPage = curPage;
            curPage = hashObj.__vpageid;
            console.log('set '+prevHash+' to '+curHash);
            prevHash = curHash;
            curHash = location.hash;
        }
        function _onHashChange(){
            _loadPage();
        }
        function _onPopState(){
            _loadPage();
        }
		//加载页面
        function _loadPage() {
            if(curHash == location.hash) return;
            _pageLeave(); //离开前一页的调用
            _setCurPage(); //设置当前页面
            console.log(prevHash+"-->"+curHash);
			visiteLog.push(prevHash+"-->"+curHash);
            _pageEnter(); //进入当前页面
        };
		function getVisitetrace(){
			return visiteLog;
		}

        //首次进入，初始化
        function _pageInit(vpageId){
            console.log(vpageId + ' is first load');
            curMod = pageList[vpageId];
            var paras = getHashParams();
            $.trigger(curMod,'vpageAdd',[{
                pageId : vpageId
            }]);
			$('.virtualPage').removeAttr('selected');
			$('.virtualPage[page=' + curPage + ']').attr('selected', 'true');
            curMod.vpageId = vpageId;
            $.trigger(window, 'vpageInit');
			$.trigger(curMod, 'vpageInit');
        }
        //进入这个页面
        function _pageEnter() {
            var paras = getHashParams();
            curMod = pageList[curPage];
            if (!curMod) {
                //使用core的require来载入js,并实现模块化管理
               require(curPage, function(){
                    _pageInit(curPage);
                    _pageEnter();
                });
            } else {
				$('.virtualPage').removeAttr('selected');
				$('.virtualPage[page=' + curPage + ']').attr('selected', 'true');
				if(curMod.prevParas!=undefined && $.param(paras.urlParams)==curMod.prevParas){
					$.trigger(curMod, 'vpageBack',[{curPage:curPage,prevPage:prevPage}]);
				}
				else{
					$.trigger(curMod, 'vpageEnter',[{curPage:curPage,prevPage:prevPage}]);
				}
				extend(curMod ,{"prevParas":$.param(paras.urlParams)});
				$.trigger(window, 'vpageEnter',[{curPage:curPage,prevPage:prevPage}]);
            }
        };
		//注册
        function register(pageInstance){
			pageList[curPage] = pageInstance;
		};
        //离开前一页
        function _pageLeave() {
            if (!curMod) {
                return;
            }
			curMod.pos = {"x":0,"y":document.body.scrollTop};
			$.trigger(window, 'vpageLeave', [{
                prevPage : prevPage,
                currentPage : curPage
            }]);
            $.trigger(curMod, 'vpageLeave', [{
                prevPage : prevPage,
                currentPage : curPage
            }]);
            curMod = null;
        };
		function getCurHash(){
			return curHash;
		}
		function getPrevHash(){
			return prevHash;
		}
        return {
            init : init,
            go : go,
			register:register,
			getCurHash:getCurHash,
			getTrace:getVisitetrace,
			getPrevHash:getPrevHash,
			notify:function(evtName,params){//当前虚拟页通知接口
					if(curMod){
						$.trigger(curMod, evtName,params);
					}
			},
			listen:function(evtName, fn){//当前虚拟页监听接口
				if(curMod){
					$.bind(curMod,evtName,fn)
				}
			}
        };
    }
    extend(PM, hashControl());
   return PM;
});