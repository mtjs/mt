Servlet proxy 使用方法
======================
1.首先需要用一个java webapp作为存放静态资源的服务器，当然可以把反向代理或者cdn等指向这个服务，对他们来说这个是透明的。
2.将java文件夹下的src里的代码copy进java工程，然后在工程的web.xml配置:

    <servlet>
        <description></description>
        <display-name>StoreIncServlet</display-name>
        <servlet-name>StoreIncServlet</servlet-name>
        <servlet-class>com.qq.storeinc.StoreIncServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>StoreIncServlet</servlet-name>
        <url-pattern>/storeinc/*</url-pattern>
    </servlet-mapping>

参见java文件夹下的web.xml
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
