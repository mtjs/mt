
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
 