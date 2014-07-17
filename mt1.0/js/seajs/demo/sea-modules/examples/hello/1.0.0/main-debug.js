define("examples/hello/1.0.0/main-debug", [ "./spinning-debug", "jquery-debug" ], function(require) {
    var Spinning = require("./spinning-debug");
    var s = new Spinning("#container");
    s.render();
});

define("examples/hello/1.0.0/spinning-debug", [ "jquery-debug" ], function(require, exports, module) {
    var $ = require("jquery-debug");
    function Spinning(container) {
        this.container = $(container);
        this.icons = this.container.children();
        this.spinnings = [];
    }
    module.exports = Spinning;
    Spinning.prototype.render = function() {
        this._init();
        this.container.css("background", "none");
        this.icons.show();
        this._spin();
    };
    Spinning.prototype._init = function() {
        var spinnings = this.spinnings;
        $(this.icons).each(function(n) {
            var startDeg = random(360);
            var node = $(this);
            var timer;
            node.css({
                top: random(40),
                left: n * 50 + random(10),
                zIndex: 1e3
            }).hover(function() {
                node.fadeTo(250, 1).css("zIndex", 1001).css("transform", "rotate(0deg)");
            }, function() {
                node.fadeTo(250, .6).css("zIndex", 1e3);
                timer && clearTimeout(timer);
                timer = setTimeout(spin, Math.ceil(random(1e4)));
            });
            function spin() {
                node.css("transform", "rotate(" + startDeg + "deg)");
            }
            spinnings[n] = spin;
        });
        return this;
    };
    Spinning.prototype._spin = function() {
        $(this.spinnings).each(function(i, fn) {
            setTimeout(fn, Math.ceil(random(3e3)));
        });
        return this;
    };
    function random(x) {
        return Math.random() * x;
    }
});
