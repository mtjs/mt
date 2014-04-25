
/*

	简介：
		mTpl是一个JavaScript的极速微模板解析引擎，速度遥遥领先，代码简短，使用非常简单，兼容性好，可以输出各种字符，支持调试，注释，作用域，xss过滤，原格式输出等。
	
	特点：
		1、极速的运行效率
		2、强大兼容性
		3、无限制的语法支持(if/for/wihle/...)
		4、微体积
		5、作用域设定
		6、调试功能
		7、xss过滤
		8、注释功能
		9、输出源码书写格式功能
		
	极速微模板解析引擎mTpl，你值得拥有！
	
*/ 

/**
 * 极速微模板解析引擎mTpl v1.0: 
 * @author: fengzhen wang
 * @param {String}  模板id || 模板text
 * @param {Object}  数据源json 
 * @param {String}  可选 要匹配的开始选择符 '<%' 、'[%' 、'<#' ..., 默认为'<%'
 * @param {String}  可选 要匹配的结束选择符 '%>' 、'%]' 、'#>' ..., 默认为'%>'
 * @param {Boolean} 可选 默认为true 
 * @return {String}	 
 * @notice & other 
 *		1、	输出"开始选择符"或"结束选择符"时, 至少其中一个字符要转成实体字符, 
 *			如可以写成<&#37; &#37;>, 输出其它字符不需要转义, 注释里面的字符不受此约束。  
 *		2、	"#"的实体"&#35;", "%"的实体"&#37;", 更多html实体对照表: 
 *			http://www.f2e.org/utils/html_entities.html
 *		3、	数据源尽量不要有太多的冗余数据。 
 *		4、	实例demo和测速demo: http://f2e.org/jt/mtpl
 */
(function(){
	var cache={}; 

	function mTpl(str, data, startSelector, endSelector, isCache){
		var t 			= this, 
			d 			= data, 
			el			= document.getElementById(str),
			tpl			= el ? el.innerHTML : str,				
			isCache 	= isCache != undefined ? isCache : true,
			valueArr	= [], 			
			fn 			= function(){},	
			htmlEncode 	= function(s){ return s;
				return s
					.replace(/&/g,'&amp;')
					.replace(/>/g,'&gt;')
					.replace(/</g,'&lt;')
					.replace(/"/g,'&quot;')
					.replace(/'/g,'&#39;');
			},
			compileFn	= function(args, strFormatTpl){
				return new Function(propArr, 
					"var mTpl_htmlEncode="+ htmlEncode.toString() + 
					";\n var s='';\n s+='" + strFormatTpl + "';\n return s");
			},			
			resetChar 	= function(c, str){
				var a=c, f=function(s){ 
					if(str.indexOf(s) >-1){
						return f(s+a);
					}
					return s;
				};				
				return f(a);
			},
			recoverChar = function(s){
				return s
					.replace(new RegExp(r,'g'),'\r')
					.replace(new RegExp(n,'g'),'\n')
					.replace(/mTpl_comment\d+;/g, function(l){
						var i=l.slice(12, l.length-1);
						return mTpl_comment[i];
					});
			},
			mTpl_comment= { length : 0 },
			l 			= resetChar('L', tpl),
			r 			= resetChar('R', tpl),
			n			= resetChar('N', tpl);
	
		if(isCache && cache[str]){
			for (var i=0, list=cache[str].propList, len=list.length; i<len; i++){
				valueArr.push(d[list[i]]);
			}	
			fn=cache[str].parsefn;
		}else{
			
			var a = startSelector, b = endSelector;				
			if(!tpl){return ''}
			if(!a || !b){a = '<' + '%'; b = '%' + '>';}				
			if(!(tpl.indexOf(a) > -1 && tpl.indexOf(b) > -1)){return tpl}
			
			var formatTpl = function(str, isError){
				var N=isError? '\n' : '';
				r=isError? '' : r;
				n=isError? '' : n;

				var	eb 	= (function(s){return s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1')})(b),
					reg	= new RegExp(l+'(?:(?!'+ eb +')[\\s\\S])*'+ eb +'|(\'+)', 'g');		

				return tpl
					.replace(/<!--(?:(?!-->)[\s\S])*-->/g, function(l){
						var i=mTpl_comment.length++;
						mTpl_comment[i]=l;
						return 'mTpl_comment'+i+';';
					})
					.split('\\').join('\\\\')
					.replace(/[\r]/g, r)
					.replace(/[\n]/g, n)
					.split(a).join(l)
					.replace(reg, function(l,$1){return $1 ? new Array($1.length + 1).join('\r') : l})
					.replace(new RegExp(l+'=(.*?)'+b,'g'), "';"+N+" s+=mTpl_htmlEncode(String($1));"+N+" s+='")
					.split(l).join("';"+N)		
					.split(b).join(N+' s+=\'')	
					.split('\r').join('\\\'');
			};

			var p, propArr = [];
			for (p in d){ 
				propArr.push(p);
				valueArr.push(d[p]);
			}

			fn = compileFn(propArr, formatTpl(str));
			isCache && (cache[str] = {parsefn : fn, propList : propArr});
		}
		
		var s;
		
		try{
			s = fn.apply(t, valueArr);
		}catch(e){
			fn = compileFn(propArr, formatTpl(str,true));
			s = fn.apply(t, valueArr);
		}
		
		return recoverChar(s);	
	} 
	
	typeof exports != 'undefined' ? exports.mTpl = mTpl : window.mTpl = mTpl;
})();
