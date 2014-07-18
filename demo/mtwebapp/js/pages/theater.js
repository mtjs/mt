/**  *create by mtWebappCreater  */
define('theater', ['jqmobi', 'pm', 'basepage', 'txTpl'], function($, pm,
                                                                  basepage, txTpl) {
    var tpl = '<div class=\"bar bar-standard bar-header-secondary\">' +
        '<form>' +
        '<input type=\"search\" placeholder=\"Search theaters\">' +
        '</form>' +
        '</div>' +
        '' +
        '<div class=\"content\">' +
        '<ul class=\"table-view\">' +
        '<li class=\"table-view-cell table-view-divider\">Theaters nearby</li>' +
        '<li class=\"table-view-cell\">' +
        'Metreon 16' +
        '<p>1.3 miles away</p>' +
        '<a class=\"btn btn-outlined btn-positive\" href=\"#\">Buy Tickets</a>' +
        '</li>' +
        '<li class=\"table-view-cell\">' +
        'AMC 5' +
        '<p>3.5 miles away</p>' +
        '<a class=\"btn btn-outlined btn-positive\" href=\"#\">Buy Tickets</a>' +
        '</li>' +
        '<li class=\"table-view-cell\">' +
        'Regal 42' +
        '<p>7.3 miles away</p>' +
        '<a class=\"btn btn-outlined btn-positive\" href=\"#\">Buy Tickets</a>' +
        '</li>' +
        '<li class=\"table-view-cell\">' +
        'Shorline theater' +
        '<p>12.5 miles away</p>' +
        '<a class=\"btn btn-outlined btn-positive\" href=\"#\">Buy Tickets</a>' +
        '</li>' +
        '<li class=\"table-view-cell\">' +
        'AMC 16' +
        '<p>12.2 miles away</p>' +
        '<a class=\"btn btn-outlined btn-positive\" href=\"#\">Buy Tickets</a>' +
        '</li>' +
        '<li class=\"table-view-cell\">' +
        'BW3 16' +
        '<p>13.4 miles away</p>' +
        '<a class=\"btn btn-outlined btn-positive\" href=\"#\">Buy Tickets</a>' +
        '</li>' +
        '<li class=\"table-view-cell\">' +
        'MC Hammer 16' +
        '<p>14.1 miles away</p>' +
        '<a class=\"btn btn-outlined btn-positive\" href=\"#\">Buy Tickets</a>' +
        '</li>' +
        '<li class=\"table-view-cell\">' +
        'AMC 3' +
        '<p>14.3 miles away</p>' +
        '<a class=\"btn btn-outlined btn-positive\" href=\"#\">Buy Tickets</a>' +
        '</li>' +
        '<li class=\"table-view-cell\">' +
        'AMC 2' +
        '<p>14.7 miles away</p>' +
        '<a class=\"btn btn-outlined btn-positive\" href=\"#\">Buy Tickets</a>' +
        '</li>' +
        '<li class=\"table-view-cell\">' +
        'AMC 10' +
        '<p>15 miles away</p>' +
        '<a class=\"btn btn-outlined btn-positive\" href=\"#\">Buy Tickets</a>' +
        '</li>' +
        '</ul>' +
        '</div>' +
        '' +
        '';
    var theaterPage = basepage.extend({
        initialize: function() {
            this.page.name = "theater";
            this.page.html = '<div class="virtualPage" page="' + this.page.name +
                '"></div>';
        },
        enter: function() {
            var _this = this;
            if (false) { /*生成时候置为false,正式的时候置成true*/
                _this.request({
                    url: window.apiUrl + "s?",
                    params: {
                        aid: 'action_api',
                        pageId: 'theater',
                        action: ''
                    },
                    canUseCache: true,
                    success: function(data) {
                        _this.renderHtml(data);
                    }
                });
            } else {
                _this.renderHtml({});
            }
        },
        renderHtml: function(data) {
            var thtml = txTpl(tpl, data);
            this.page.wrapper.html(thtml);
        },
        leave: function() {},
        back: function() {},
        bindMethod: function() {
            var _this = this,
                jdom = this.jdom;
            jdom.delegate('.test', "click", function() {});
        }
    });
    new theaterPage();
})