define('basepage', ['jqmobi','pm'], function ($, pm) {

//define('basepage', ['jqmobi','pm','loginMod','tipsModule','lawnchair'], function ($, pm, loginModule, tipsModule, Lawnchair) {
    /**
     * 通用构造方法 子类可覆盖
     * @param page
     * @constructor
     */
    var BasePage = function(page) {
        this.page = {};
        this.jdom = null;
        this.initialize.apply(this, arguments); // 执行子类 initialize
        this.bind_PM_Events();
        pm.register(this);
    };

    var ajaxCache;

//    try{
//        ajaxCache = new Lawnchair({
//            adapter: 'webkit-sqlite'
//        }, function() {});
//    } catch(e) {
//        alert(e);
//    }

    $.extend(BasePage.prototype, {

        // 子类初始执行方法
        initialize: function(){},

        init: function(){
            this.page.wrapper = $('.virtualPage[page="' + this.page.name + '"]');
            this.bindMethod();
        },
        pageAdd: function() {
            var page = this.page;
            if ($('.virtualPage[page=' + page.name + ']').length === 0) {
                $("#wrapper").append(page.html);
            }
            this.jdom = $('.virtualPage[page=' + page.name + ']');
            $('.virtualPage[page=' + page.name + ']').css('height','100%');
        },

        enter: function(){},
        leave: function(){},
        back: function(){},
        renderHtml: function(){},
        bindMethod: function(){},

        // 与 PM 对接事件
        bind_PM_Events: function() {
            var _this = this;

            $.bind(this, 'vpageLeave', function(opts) {
                _this.leave(opts);
            });
            $.bind(this, 'vpageEnter', function(opts) {
                _this.enter(opts);
            });
            $.bind(this, 'vpageBack', function(opts) {
                _this.back(opts);
            });
            $.bind(this, 'vpageInit', this.init);
            $.bind(this, 'vpageAdd', this.pageAdd);
        },

        // ajax 请求方法封装 sid 及 统计信息
        request: function(opts){
            var _this = this;
            var emtpyFn = function(){};
            var cacheId = opts.url + JSON.stringify(opts.params);
            var success = opts.success ? opts.success : emtpyFn;
            var error = opts.error ? opts.error : emtpyFn;
            var canUseCache = opts.canUseCache && ajaxCache;
            opts.type = opts.type || 'GET';
            opts.dataType = opts.dataType || 'json';

            var handleSuccess = function(data) {
                // 通用错误提示
                success.call(_this, data);
            };

            opts.success = function(data) {
                handleSuccess.call(_this, data);
                if(canUseCache) {
                    ajaxCache.save({
                        key: cacheId,
                        date: new Date().getTime(),
                        v: data
                    });
                }
            };
            opts.error = function(e) {
                if(canUseCache) {
                    ajaxCache.get(cacheId, function(data) {
                        if(data) {
                            handleSuccess.call(_this, data.v);
                        }else{

                            error.apply(_this, arguments)
                        }
                    });
                } else {
                    error.apply(_this, arguments)
                }
            };

            this._ajax(opts);
        },

        // 实际发送请求
        _ajax: function(opts) {
            $.ajax({
                'dataType': opts.dataType,
                'type': opts.type,
                'url': opts.url,
                'data': opts.params,
                'beforeSend': function () {
                    $.trigger(window, 'ajaxBeforeSend');
                },
                'success': opts.success,
                'error': opts.error,
                'timeout': 6000,
                'complete': function () {
                    $.trigger(window, 'ajaxComplete');
                }
            });
        },

    });

    // 生产 BasePage 子类的方法
    BasePage.extend = function(protoProps, staticProps) {
        var child,
            parent = BasePage,
            ctor = function(){};

        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function(){ parent.apply(this, arguments); };
        }

        $.extend(child, parent);

        ctor.prototype = parent.prototype;
        child.prototype = new ctor();

        if (protoProps) $.extend(child.prototype, protoProps);
        if (staticProps) $.extend(child, staticProps);

        child.prototype.constructor = child;
        child.__super__ = parent.prototype;
        return child;
    };

    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        return r ? decodeURIComponent(r[2]) : null;
    }

    return BasePage;
})