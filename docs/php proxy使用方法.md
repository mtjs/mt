php proxy 使用方法
==================

1.首先需要用一个支持php的webserver(比如apache,nginx等)作为存放静态资源的服务器，当然可以把反向代理或者cdn等指向这个服务，对他们来说这个是透明的。

2.配置mod-rewrite,把对静态资源的请求映射到storeinc.php上,以apache为例
    RewriteEngine on 
    RewriteRule storeinc/(.+).js$ storeinc.php?file=$1

然后在首页配置js
    <script type="text/javascript" id="file_config">
        var g_config = {
            jsmap:{
                'init': 'base.js',
                'util': 'base.js',
                'p1': 'page/p1.js',
                'p2': 'page/p2.js',
                'p3': 'page/p3.js'
            },
            storeInc:{
                'store': true,
                'inc': true,
				'proxy':true,
                'debug': false
            },
            testEnv: false,
            staticPath: '/release',
			serverDomain: 'http://localhost:6600/storeinc',
            buildType: 'project',
            ver: '2014012000050'
        };
    </script>
