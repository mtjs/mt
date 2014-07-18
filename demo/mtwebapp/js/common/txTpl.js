/**
	模板解析器txTpl v1.1 版本 更新如下：
	1、修复了多数模板解析器都不能输出多个单引号的问题。
	2、修复参数str既不是id又不包含边界符时出错的问题。
	3、代码重新组织，并且支持模块化加载部署。
	4、增加实例demo和测速demo，link: http://f2e.org/jt/txtpl
 */
 
 
/**
 * 模板解析器txTpl v1.1: 
 * @author: wangfz
 * @param {String}  模板id || 原始模板text
 * @param {Object}  数据源json 
 * @param {String}  可选 要匹配的开始选择符 '<%' 、'[%' 、'<#' ..., 默认为'<%'
 * @param {String}  可选 要匹配的结束选择符 '%>' 、'%]' 、'#>' ..., 默认为'%>'
 * @param {Boolean} 可选 默认为true 
 * @return {String}	 
 * @notice 1、输出"开始选择符"或"结束选择符"时, 至少其中一个字符要转成实体字符, 如可以写成<&#37; &#37;>, 输出其它字符不需要转义。  
 *         2、"#"的实体"&#35;", "%"的实体"&#37;", 更多html实体对照表: http://www.f2e.org/utils/html_entities.html。
 *         3、数据源尽量不要有太多的冗余数据。 
 */
(function(){
	var w=window, cache={}; 	
	
	function txTpl(str, data, startSelector, endSelector, isCache){
		var fn, d=data, valueArr=[], isCache=isCache!=undefined ? isCache : true;
		if(isCache && cache[str]){
			for (var i=0, list=cache[str].propList, len=list.length; i<len; i++){valueArr.push(d[list[i]]);}	
			fn=cache[str].parsefn;
		}else{
			var a=startSelector, b=endSelector, propArr=[], formatTpl=(function(str){				
				if(!a){a='<'+'%'; b='%'+'>';}
				var el=document.getElementById(str), tpl=el? el.innerHTML : str;			
				return tpl
					.replace(/\\/g, "\\\\") 
					.replace(/[\r\t\n]/g, " ") 	
					.split(a).join("\t") 
					.replace(/'/g, "\r")
					.replace(new RegExp("\t=(.*?)"+b,"g"), "';\n s+=$1;\n s+='")  
					.split("\t").join("';\n")	
					.split(b).join("\n s+='")	
					.split("\r").join("\\'");
			})(str);
			
			for (var p in d) {propArr.push(p);valueArr.push(d[p]);}	
			fn = new Function(propArr, "var s='';\n s+='" + formatTpl+ "';\n return s");
			isCache && (cache[str]={parsefn:fn, propList:propArr});
		}

		try{
			return fn.apply(w,valueArr);
		}catch(e){			
			var fnName='txTpl'+Date.now(), fnStr='var '+ fnName+'='+fn.toString(), 
			head=document.getElementsByTagName("head")[0], script = document.createElement("script");
			ua = navigator.userAgent.toLowerCase(); 
			if(ua.indexOf('gecko') > -1 && ua.indexOf('khtml') == -1){w['eval'].call(w, fnStr); return}				
			script.innerHTML = fnStr; 
			head.appendChild(script); 
			head.removeChild(script);
			w[fnName].apply(w,valueArr);
		}
	} 
	
	typeof exports != "undefined" ? exports.txTpl = txTpl : w.txTpl = txTpl;	
})();
//add by waynelu  core wrap
if(define){
	define('txTpl',[],function () {console.log('txTpl');return txTpl});
}

