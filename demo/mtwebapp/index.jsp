    <!DOCTYPE HTML>
            <% boolean testEnv=false; %>
        <html>

        <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0,user-scalable=no" />
        <meta name="format-detection" content="telephone=no">
        <meta name="author" content="Tencent.mt" />
        <meta name="copyright" content="Copyright (c) 1998-2014 mt" />
        <meta name="description" content="mt" />
        <title>mtwebapp</title>
        <style type="text/css">
        .virtualPage {
        display: none
        }
        .virtualPage[selected='true'] {
        display: block
        }
        </style>
        <link href="css/app.css" rel="stylesheet" type="text/css">
        <link href="css/ratchet.min.css" rel="stylesheet" type="text/css">
        <script>
        window.isOs7 = (navigator.userAgent).indexOf('OS 7') !== -1;
        if (window.screen.height == 568) {
        document.querySelector('meta[name="viewport"]').content = "width=320,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no";
        }
        </script>
        </head>

        <body>
        <div id="t_page">
        <header class="bar bar-nav">
        <a class="icon icon-gear pull-right" href="#settingsModal"></a>
        <h1 class="title">Movie finder</h1>
        </header>
        <div id="scroll" style="padding-top:40px;z-index:1;overflow:hidden;">
        <div id="wrapper"></div>
        </div>
        </div>
            <%if(!testEnv) {%>
        <script type="text/javascript" id="file_config">
        var g_config = {
        jsmap: {
        "jqmobi": "/base.js",
        "pm": "/base.js",
        "basepage": "/base.js",
        "txTpl": "/base.js",
        "theater": "/pages/theater.js",
        "index": "/pages/index.js",
        "init": "/base.js"
        },
        storeInc:{
            //统计回调，统计脚本请求情况,jsUrl是js地址，mode是请求模式，
            //full:表示全量请求，inc表示增量请求，local表示从本地存储读取
            statFunc:function(jsUrl,mode){
                console.log('get '+jsUrl+' from '+mode);
            },
            //写本地存储异常回调，将脚本内容写入本地存储出现异常的时候调用，
            //用来提供给业务清理本地存储，storekey表示写如的key
            storeExFunc:function(storeKey){
                console.log('set store item '+storeKey+' exception') ;
            },
            'store': true,
            'inc': true,
            'proxy':true,
            'debug': false
        },
        //是否走combo,同时支持conf指定哪几个js是合并下载的

        combo:{cb:true,conf:[]},
        testEnv: false,
        staticPath: 'release',
        serverDomain: 'http://localhost:8080/testweb/storeinc/',
        ver: '2014071600018',
        buildType: 'project'
        }
        </script>
            <%} else {%>
        <script type="text/javascript">
        var g_config = {
        jsmap: {
        "jqmobi": "common/jqmobi.js",
        "pm": "common/pm.js",
        "basepage": "common/basepage.js",
        "txTpl": "common/txTpl.js",
        "theater": "pages/theater.js",
        "index": "pages/index.js",
        "init": "init.js"
        },
        storeInc: {},
        staticPath: 'js',
        serverDomain:'',
        testEnv: true
        };
        </script>
            <%}%>
        <script type="text/javascript" src="js/common/core.js"></script>
        <script type="text/javascript" src="js/common/storeIncLoad.js"></script>
        <script type="text/javascript">
        MT.config(g_config);
        require('init');
        </script>
        </body>

        </html>