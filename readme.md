

MT
=============
<p >MT是手机腾讯网前端团队开发维护的一个专注于移动端的、带有增量更新特色的js模块管理框架</p>

<p >我们的官网是<a href="http://mt.tencent.com">http://mt.tencent.com</a>,<a href="https://mtjs.github.io">https://mtjs.github.io</a></p>
<h3>我们的github:<a href="https://github.com/mtjs/mt">https://github.com/mtjs/mt</a>,如果觉得MT是个靠谱的项目，请给我们star,您的支持是我们最大的动力</h3>

<h4><a href="#overview"><i class="icon-chevron-right"></i> 为什么使用MT</a></h4>
<h4><a href="#storeinc"><i class="icon-chevron-right"></i> MT增量更新技术方案介绍</a></h4>
<h4><a href="#combo"><i class="icon-chevron-right"></i> MT的COMBO介绍</a></h4>
<h4><a href="#callback"><i class="icon-chevron-right"></i> MT的异常和统计回调</a></h4>
<h4><a href="#quickstart"><i class="icon-chevron-right"></i>快速上手</a></h4>
<h4><a href="#demo"><i class="icon-chevron-right"></i>webapp demo</a></h4>
<h4><a href="#who"><i class="icon-chevron-right"></i>谁在使用MT</a></h4>
<h4><a href="#github"><i class="icon-chevron-right"></i>下载</a></h4>

<section id="overview">
    <div class="page-header">
        <h1>为什么使用MT</h1>
    </div>
    <p>在快速迭代版本过程中，我们有时候只修改了某个js中的<strong>几行代码</strong>，却需要用户下载<strong>整个js文件</strong>，这在重视流量的移动端显得非常浪费，mt独创的<strong>增强更新算法</strong>实现了修改多少代码就只下载修改代码的功能，为用户和公司节省大量流量</p>
    <p>比如某次修改我们需要修改下面的代码,在mt mthelloworld 后面加上ok两个字符,即把</p>
    <pre >
        define('mthelloworld', [], function () {
                    console.log('mt helloworld');
        });
        }
    </pre>
    <p>修改为</p>
    <pre >
        define('mthelloworld', [], function () {
                    console.log('mt helloworld ok');
        });
        }
    </pre>
    <p>通常情况下我们需要用户下载整个这个模块的js代码，但是如果使用了mt,用户只需要下载一下一行代码：</p>
    <pre>
       [[0,50],'ok',[52,90]]
    </pre>
    <h3>这就是MT的主要作用，在版本更新的时候能做到字符级别的增量更新，为用户和公司节省流量,真正做到了无更新不下载！</h3>
</section>




<section id="storeinc">
<div class="page-header">
<h1>MT增量更新技术方案介绍</h1>
</div>
<h3>总体流程介绍</h3>
<p>增量更新依赖于localstorage,所以浏览器必须支持localstorage。android和ios两大平台目前都支持。</p>
<p>增量更新流程如下图所示：</p>
<p><img src='https://mtjs.github.io/img/storeinc.png'></p>
<p>localstorage里面存储的上个版本的js内容和版本号，当本次版本号和上次版本号不一致的时候，mt拼接出增量文件url去拉取增量文件，并和上个版本的js内容合并生成新版本内容。整个方案得核心在于增量文件得计算和合并，接下来介绍mt支持的2种增量更新算法。</p>
<h3>基于chunk的增量更新算法</h3>
<p>在mt1.0里面，增量文件的计算和增量文件和旧版本内容的合并主要基于chunk算法，这个算法的原理是通过将js分块并滚动比较取得两个版本内容，获取增量文件。具体得算法设计请看下面这个PDF:</p>
<a href="https://mtjs.github.io/img/mt1.pdf">mt1.0js增量更新技术实现</a>

<h3>基于编辑距离计算的增量更新算法</h3>
<p>mt1.0的chunk算法基于分块计算，增量更新的精确度依赖于chunk的大小，在实际使用中总是会有不少代码需要冗余下载，为此在mt2.0里面增加路基于编辑距离计算的增量更新算法，具体的实现方案的PDF如下：</p>
<a href="https://mtjs.github.io/img/mt2.pdf">mt2.0js基于编辑距离计算的增量更新技术实现</a>

<h3>mixdiff:基于编辑距离计算，chunk两种算法的增量更新</h3>
<p>编辑距离计算可以精确到字符，但是需要用一个矩阵来存储字符，本身会占用很大的内存，基本上比较难于用在生产环境里，
    所以我们的mixdiff融合了以上两种算法，提高了算法的性能，并能实现字符级别的增量更新。
    mixdif其实就是：对于比较字符串比较短的字符用lcs来计算增量文件，对于比较长的字符串用chunkdiff来找出2个字符串的最大公共子字符串，然后用这个字符串将新旧2个字符串都切成前缀、公共子串、后缀。
    然后分别用2个前缀，后缀为参数递归调用mixdiff来实现增量文件计算的方式。流程图如下：
</p>
<img src="https://mtjs.github.io/img/mixdiff_flow.png">
<p>程序流程图如下：</p>
<img src="https://mtjs.github.io/img/mixdiff_codeflow.png">

</section>


<section id="combo">
<div class="page-header">
<h1>MT的COMBO介绍</h1>
</div>
<p>作为一个基于AMD规范的模块管理框架，mt还提供灵活的combo支持.mt的combo支持包含一下几种方式：</p>
<h3>冷combo</h3>
<p>冷combo就是在打包混淆的时候把多个不同的模块打包进同一个js,前台下载的时候直接下载这个js，比如打包配置如下：</p>
<pre >
    {
                 './release/{pv}/base-{fv}.js': {
                        files: ['./js/init.js','./js/util.js']
                 },
                 './release/{pv}/page/p1-{fv}.js': {
                    files: ['./js/page/p1.js']
                 },
                 './release/{pv}/page/p2-{fv}.js': {
                    files: ['./js/page/p2.js']
                 },
                 './release/{pv}/page/p3-{fv}.js': {
                    files: ['./js/page/p3.js']
                 }
    }
</pre>
<p>可以看到我们的init,util模块被打到base.js里，达到冷combo的目的</p>

<h3>热combo，半热combo</h3>
<p>半热combo是相对冷combo来说的，除了走打包实现冷combo以外，我们还支持通过前台配置来实现半热combo或热combo</p>
<pre>
combo:{
                         //是否启用combo
                        cb:true,
                        //哪些模块的js走半热combo一块下载
                       //，这里数组的每个项是要一起下载的模块
                        conf:['init,util','p1,p2,p3']

}
</pre>
<p>上面的代码，我们设置了combo的cb为true,说明走combo. conf的配置则设置了哪些模块是要走combo一起下载的， 即使打包脚本没有把他们打在一起。 为了看效果，我们先把cb设为false，conf设置为空数组,表示不走combo：</p>
<pre >                          combo:{
                           //是否启用combo
                           cb:flase,
                           //哪些模块的js走半热combo一块下载
                           //，这里数组的每个项是要一起下载的模块
                           conf:[]

                           }

</pre>
<p>我们看下网络请求：</p>
<img src="https://mtjs.github.io/img/nocombo.png">
<p>可以看到base.js,p1.js,p2.js,p3.js是分开下载的，说明没有走combo   </p>

<p>然后设置了combo的cb为true,说明走combo. 我们看下网络请求：</p>
<img src="https://mtjs.github.io/img/hotcombo.png">
<p>可以看到base.js,p1.js是分开下载的，而p2.js,p3.js是一起下载的，这是因为mt2.0自己分析了依赖，把某个模块共同依赖一起下载了，这个例子里面p1依赖了p2,p3两个模块 所以p2,p3被一起下载了，这就是热combo!  </p>

<p>这时候我们想,我想让p1,p2,p3一次就下载了，怎么弄？很简单，我们只要设置combo.conf为如下: </p>
<pre >
combo:{
//是否启用combo
cb:true,
//哪些模块的js走半热combo一块下载
//，这里数组的每个项是要一起下载的模块
conf:['init,util','p1,p2,p3']

}
</pre>
<p>我们看下网络请求：</p>
<img src="https://mtjs.github.io/img/halfhotcombo.png">
<p>ok，p1,p2,p3一次就下载了！！，这就是半热combo,需要配置一下conf.        </p>
</section>





<section id="callback">
<div class="page-header">
<h1> MT的异常和统计回调</h1>
</div>
<p>为了方便统计和及时清理本地存储，mt还提供了本地存储异常和统计两种回调。通过设施g_config的storeInc对象的statFunc,storeExFunc两个函数，可以设置统计和本地存储异常回调 , statFunc在请求每个js的时候触发,便于统计每个js的请求情况，storeExFunc在写本地存储异常回调， 将脚本内容写入本地存储出现异常的时候调用，用来提供给业务清理本地存储</p>
<pre >
storeInc:{
            //统计回调，统计脚本请求情况,jsUrl是js地址，
            //mode是请求模式，full:表示全量请求，
            //inc表示增量请求，local表示从本地存储读取
            'statFunc':function(jsUrl,mode){
                console.log('get '+jsUrl+' from '+mode);
            },
            //写本地存储异常回调，将脚本内容写入本地存储
            //出现异常的时候调用，用来提供给业务清理本地存储
            //，storekey表示写如的key
            'storeExFunc':function(storeKey){
                console.log('set store item '+storeKey+' exception');
            },
            'store': true,
            'inc': true,
            'proxy':true,
            'debug': false
},
</pre>

</section>


<div class="page-header">
    <h1>快速上手</h1>
</div>
<p>到这里我们基本上对mt有了一个基本的了解，下面我们通过一个例子来快速上手,并通过这个例子来看看mt做增量更新的效果(本例我们可以在demo目录下的quickstart里找到):</p>

<h2>基于AMD的模块定义</h2>
<p>mt首先是一个基于amd规范得模块管理框架，所以模块的定义我们实用了最简单的一种方式：</p>
<pre><code>
        define('p1', ['p2', 'p3'], function (p2, p3) {
            var o = {
                k: 'v'
            };
            return o;
        });
</code></pre>
<p>用define来定义模块,其中第一个参数是模块id,第二个参数是依赖，第三个参数是方法定义，返回值是该模块的定义</p>
<h3>mt映射和回调配置</h3>
<p>跟其他模块管理框架一样，mt也有自己的模块到文件映射、增量更新配置、版本配置、回调配置等，下面是本例是我一个配置：</p>

<pre><code>
var g_config =  {
    jsmap:{
        'init': 'base.js',
        'util': 'base.js',
        'p1': 'page/p1.js',
        'p2': 'page/p2.js',
        'p3': 'page/p3.js'
    },
    storeInc:{
        //统计回调，统计脚本请求情况,jsUrl是js地址，
        //mode是请求模式，full:表示全量请求，
        //inc表示增量请求，local表示从本地存储读取
        'statFunc':function(jsUrl,mode){
            console.log('get '+jsUrl+' from '+mode);
        },
        //写本地存储异常回调，将脚本内容写入本地
        //存储出现异常的时候调用，用来提供给业务
        //清理本地存储，storekey表示写如的key
        'storeExFunc':function(storeKey){
            console.log('set store item '+storeKey+' exception') ;
        },
        'store': true,
        'inc': true,
        'proxy':true,
        'debug': false
    },
    //是否走combo,同时支持conf指定哪几个js是合并下载的

    combo:{cb:true,conf:["init,util","p1,p2,p3"]},
    testEnv: false,
    staticPath: '/release',
    serverDomain: 'http://localhost:6600',
    buildType: 'project',
    ver: '2014053000002'  //版本号

};
</code></pre>
<p>在2014053000002版本，我们的p2代码如下： </p>
<pre><code>
define('p2', [], function () {
        console.log('p2 ok!');
        document.write('p2 ok!');
        });
}
</code></pre>
<h3>打包</h3>
<p>mt的打包主要是用mt自己的mtbuild.js来做的，功能主要是根据规则压缩混淆合并js,同时生成上个版本的增量文件。我们运行demo/quickstart目录下的build.sh ,其实是执行mtbuild.js命令：</p>
<pre><code>node ../../js/mtbuild.js test.html build.conf  lcs</code></pre>
<p>第三个参数说明走编辑距离计算增量更新算法，你也可以设置成chunk走chunk算法 </p>
<h3>启动增量服务</h3>

<p>mt目前除了mt build生成增量文件以外，还提供了在服务端生成增量文件的server,包括java,nodejs两个版本，这里我们用以下nodejs版本。到js目录下执行命令</p>

<pre><code> node storeincServer.js lcs ../demo/quickstart </code></pre>
<p>第2个参数说明走lcs增量更新算法，你也可以设置成chunk走老算法，第三个参数是根目录，这里设置成../demo/quickstart </p>

<h3>效果演示</h3>

<p>打开chrome(必须支持localstorage),输入地址:http://localhost:6600/test.html ,可以看到请求的是全量的js</p>
<img src="https://mtjs.github.io/img/02full.png">
<p></p>
<p>本地存储里的内容是2014053000002版本的:</p>
<img src="https://mtjs.github.io/img/02local.png">
<p><p>
<p>接着我们修改p2.js代码，加上"lcs"这3个字 ：</p>
</pre></code>
define('p2', [], function () {
    console.log('p2 ok!');
    document.write('p2 ok lcs!');
});
</code></pre>
<p>然后重新运行命令  </p>

</pre></code>node ../../js/mtbuild.js test.html build.conf  lcs    </code></pre>
<p> 这时候生成2014053000003版本代码，打开chrome(必须支持localstorage), 输入地址:http://localhost:6600/test.html ,这时候可以看到请求的内容是增量的,并且精确到了字符级别: </p>
<p></p>
<img src="https://mtjs.github.io/img/lcs.png">
<p>我们来看下同样是这个修改，如果我们走chunk算法，会是什么样子。 我们需要重新走一遍上边的流程，但是把build.sh命令的lcs参数改成chunk,启动storeincServer时的lcs也改成chunk, 这里就不罗嗦步骤了，我们直接看看走chunk是的网络请求：</p>
<p></p>
<img src="https://mtjs.github.io/img/chunk.png">
<p></p>
<p>相对chunk算法，基于lcs算法的能更加精确</p>





<section id="demo">
    <div class="page-header">
        <h1>一个完整的webapp demo</h1>
    </div>
    <p>通过上一个例子，我们大概了解mt的功能和原理，并对增量更新效果有了一个基本的认识。下面我们再来看一个基于mt做手机单页面webapp的例子，这个例子里面我会用到以下几个东西：
   </p>
    <ul>
        <li>基于jetty的java版本的增量更新服务</li>
        <li>pm.js:一个基于hashChange的单页面路由</li>
        <li>mtpl:一个高性能小体积的js模版引擎</li>
        <li>ratchet:一个针对移动的css框架</li>
    </ul>
    <p>本例其实是ratchet自带例子里的movie finder的一个改造，这里简化一下原例，并接入mt实现增量更新。
    </p>
    <p>我们用jetty作为server,把demo下的mtwebapp目录放到jetty的webapps目录下,mtwebapp本身已经包含所有的java类（打包成mt.jar).</p>
    <h3>servlet配置</h3>
    <p>java版本的增量更新代理是一个servlet,所以我们需要再web.xml里配置:
    </p>
    <pre class=”prettyprint linenums Lang-xml”>
    &lt;display-name&gt;StoreIncServlet&lt;/display-name&gt;
    &lt;servlet-name&gt;StoreIncServlet&lt;/servlet-name&gt;
    &lt;servlet-class&gt;com.storeinc.StoreIncServlet&lt;/servlet-class&gt;
    &lt;init-param&gt;
    &lt;param-name&gt;jsPath&lt;/param-name&gt;
    &lt;param-value&gt;/Users/waynelu/nginxhtmls/jetty/webapps/mtwebapp/&lt;/param-value&gt;
    &lt;/init-param&gt;
    &lt;init-param&gt;
    &lt;param-name&gt;chunkSize&lt;/param-name&gt;
    &lt;param-value&gt;12&lt;/param-value&gt;
    &lt;/init-param&gt;
    &lt;init-param&gt;
    &lt;param-name&gt;diffAlg&lt;/param-name&gt;
    &lt;param-value&gt;lcs&lt;/param-value&gt;
    &lt;/init-param&gt;
    &lt;/servlet&gt;
    &lt;servlet-mapping&gt;
    &lt;servlet-name&gt;StoreIncServlet&lt;/servlet-name&gt;
    &lt;url-pattern&gt;/storeinc/*&lt;/url-pattern&gt;
    &lt;/servlet-mapping&gt;
     </pre>
    <p>jsPath:js存放目录</p>
    <p>chunkSize:chunk算法的块长度</p>
    <p>diffAlg:增量更新算法，可以为chunk或者lcs</p>
    <h3>运行demo</h3>
    <p>到jetty/bin地下运行：</p>
    <pre>
    ./jetty.sh start
    </pre>
    <p>为了看到增量更新效果，我们在mtwebapp里放了index.jsp和index1.jsp两个文件，分别对应2014071600018，2014071500017两个版本的js.在地址栏里输入：http://localhost:8080/mtwebapp/index.jsp 和 http://localhost:8080/mtwebapp/index1.jsp ，我们可以看到这两个版本增量更新的效果</p>
    <p>java相关代码在java目录下</p>
</section>




<div class="page-header">
        <h1>谁在使用mt</h1>
</div>
<p>
    <table>
     <tr>
         <td>
         <span>
    <a href="http://infoapp.3g.qq.com/g/s?aid=nbasearch&amp;icfa=home_touch&amp;iarea=98&amp;i_f=235#home" >
        <div class="img-tit" >NBA</div>
        <img pl="1" alt="nba" src="http://3glogo.gtimg.com/wap30/info/info5/img/app/NBA.jpg">

    </a>
    </span>
    </td>

    <td>
    <span>
    <a href="http://infoapp.3g.qq.com/g/s?sid=AV-STHlv9Fb_E6Jb0P0_Pdtn&amp;aid=movie&amp;i_f=225">
        <div class="img-tit">爱电影</div>
        <img alt="爱电影" pl="1" src="http://3glogo.gtimg.com/wap30/info/info5/img/app/imovie.png">

    </a>
        </span>
        </td>

        <td>
        <span>
    <a href="http://gp.3g.qq.com/g/s?sid=AV-STHlv9Fb_E6Jb0P0_Pdtn&amp;aid=ifinance&amp;i_f=271#fund/0">
        <div class="img-tit">爱理财</div>
    <img alt="爱理财" pl="1" src="http://3gimg.qq.com/wap30/info/info5/img/ifinance.png">

    </a>
       </span>
       </td>

       <td>
       <span>
    <a href="http://infoapp.3g.qq.com/g/s?aid=medialib&amp;iarea=98&amp;i_f=237">
        <div class="img-tit">悦读</div>
        <img pl="1" alt="悦读" src="http://3glogo.gtimg.com/wap30/info/info5/img/app/iread.jpg">

    </a>
     </a>
      </span>
      </td>

      <td>
      <span>
    <a href="http://infoapp.3g.qq.com/g/s?aid=touchauto&amp;iarea=98&amp;i_f=238">
        <div class="img-tit">车典</div>
        <img pl="1" alt="车典" src="http://3glogo.gtimg.com/wap30/info/info5/img/app/autolib.jpg">

    </a>
     </span>
     </td>
     </tr>
     <tr>
     <td>
     <span>
    <a href="http://infoapp.3g.qq.com/g/s?aid=carshow&amp;iarea=98&amp;i_f=239">
        <div class="img-tit">秀车</div>
        <img pl="1" alt="秀车" src="http://3glogo.gtimg.com/wap30/info/info5/img/app/carshow.jpg">

    </a>
     </span>
     </td>

     <td>
     <span>
    <a href="http://live.3g.qq.com/g/touch2/?&amp;iarea=98&amp;i_f=240#home">
        <div class="img-tit">爱直播</div>
        <img pl="1" alt="爱直播" src="http://3glogo.gtimg.com/wap30/info/info5/img/app/ilive.jpg">

    </a>
    </span>
    </td>

    <td>
    <span>
        <a href="http://infoapp.3g.qq.com/g/s?aid=sportpicguess">
            <div class="img-tit">体育猜图</div>
            <img pl="1" alt="体育猜图" width="100px" src="http://3gimg.qq.com/wap30/info/info5/img/caitu.png">
        </a>
       </span>
       </td>
  
       <td>
       <span>
        <a href="http://infoapp.3g.qq.com/g/s?&aid=common_webapp&webapp=nbaky">
            <div class="img-tit">狂言NBA</div>
            <img width="100px" alt="狂言NBA" src="http://infopic.gtimg.com/info/images/2014/7/140436769816885735.png">

        </a>
    </span>
    </td>

    <td>
    <span>
        <a href="http://infoapp.3g.qq.com/g/s?&aid=common_webapp&webapp=jiecao">
            <div class="img-tit">节操新闻</div>
            <img width="100px" alt="狂言NBA" src="http://infopic.gtimg.com/info/images/2014/3/139597306809381261.png">

        </a>
     </span>
     </td>

     </tr>
     </table>
</p>

    
<h1>我们的github:<a href="https://github.com/mtjs/mt">https://github.com/mtjs/mt</a> , 如果觉得MT是个靠谱的项目，请给我们star,您的支持是我们最大的动力</h1>












