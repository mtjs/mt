/**  *create by mtWebappCreater  */
define('index', ['jqmobi', 'pm', 'basepage', 'txTpl'], function($, pm, basepage,
                                                                txTpl) {
    var tpl = '<div class=\"bar bar-standard bar-header-secondary\">' +
        '<form>' +
        '<input type=\"search\" placeholder=\"Search\">' +
        '</form>' +
        '</div>' +
        '' +
        '<div class=\"content\">' +
        '' +
        '<div class=\"slider\">' +
        '<div class=\"slide-group\">' +
        '<div class=\"slide\">' +
        '<img src=\"img/argo.png\" alt=\"Argo\" width=\"640\" height=\"300\">' +
        '</div>' +
        '<div class=\"slide\">' +
        '<img src=\"img/skyfall.png\" alt=\"Skyfall\" width=\"640\" height=\"300\">' +
        '</div>' +
        '<div class=\"slide\">' +
        '<img src=\"img/ralph.png\" alt=\"Wreck-It Ralph\" width=\"640\" height=\"300\">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '' +
        '<ul class=\"table-view\">' +
        '<li class=\"table-view-cell table-view-divider\">Recommended movies</li>' +
        '<li class=\"table-view-cell media\">' +
        '<a class=\"navigate-right\" href=\"#theater\" data-transition=\"slide-in\">' +
        '<img class=\"media-object pull-left\" src=\"http://placehold.it/64x64\" alt=\"Placeholder image for Argo\'s poster\">' +
        '<div class=\"media-body\">' +
        'Argo' +
        '<p>Lorem ipsum dolor sit amet, consectetur.</p>' +
        '</div>' +
        '</a>' +
        '</li>' +
        '<li class=\"table-view-cell media\">' +
        '<a class=\"navigate-right\" href=\"#theater\" data-transition=\"slide-in\">' +
        '<img class=\"media-object pull-left\" src=\"http://placehold.it/64x64\" alt=\"Placeholder image for Skyfall\'s poster\">' +
        '<div class=\"media-body\">' +
        'Skyfall: 007' +
        '<p>Lorem ipsum dolor sit amet, consectetur.</p>' +
        '</div>' +
        '</a>' +
        '</li>' +
        '<li class=\"table-view-cell media\">' +
        '<a class=\"navigate-right\" href=\"#theater\" data-transition=\"slide-in\">' +
        '<img class=\"media-object pull-left\" src=\"http://placehold.it/64x64\" alt=\"Placeholder image for Wreck-it Ralph\'s poster\">' +
        '<div class=\"media-body\">' +
        'Wreck-it Ralph' +
        '<p>Lorem ipsum dolor sit amet, consectetur.</p>' +
        '</div>' +
        '</a>' +
        '</li>' +
        '<li class=\"table-view-cell media\">' +
        '<a class=\"navigate-right\" href=\"#theater\" data-transition=\"slide-in\">' +
        '<img class=\"media-object pull-left\" src=\"http://placehold.it/64x64\" alt=\"Placeholder image for Argo\'s poster\">' +
        '<div class=\"media-body\">' +
        'Argo' +
        '<p>Lorem ipsum dolor sit amet, consectetur.</p>' +
        '</div>' +
        '</a>' +
        '</li>' +
        '<li class=\"table-view-cell media\">' +
        '<a class=\"navigate-right\" href=\"#theater\" data-transition=\"slide-in\">' +
        '<img class=\"media-object pull-left\" src=\"http://placehold.it/64x64\" alt=\"Placeholder image for Skyfall\'s poster\">' +
        '<div class=\"media-body\">' +
        'Skyfall: 007' +
        '<p>Lorem ipsum dolor sit amet, consectetur.</p>' +
        '</div>' +
        '</a>' +
        '</li>' +
        '<li class=\"table-view-cell media\">' +
        '<a class=\"navigate-right\" href=\"#theater\" data-transition=\"slide-in\">' +
        '<img class=\"media-object pull-left\" src=\"http://placehold.it/64x64\" alt=\"Placeholder image for Wreck-it Ralph\'s poster\">' +
        '<div class=\"media-body\">' +
        'Wreck-it Ralph' +
        '<p>Lorem ipsum dolor sit amet, consectetur.</p>' +
        '</div>' +
        '</a>' +
        '</li>' +
        '<li class=\"table-view-cell media\">' +
        '<a class=\"navigate-right\" href=\"#theater\" data-transition=\"slide-in\">' +
        '<img class=\"media-object pull-left\" src=\"http://placehold.it/64x64\" alt=\"Placeholder image for Argo\'s poster\">' +
        '<div class=\"media-body\">' +
        'Argo' +
        '<p>Lorem ipsum dolor sit amet, consectetur.</p>' +
        '</div>' +
        '</a>' +
        '</li>' +
        '<li class=\"table-view-cell media\">' +
        '<a class=\"navigate-right\" href=\"#theater\" data-transition=\"slide-in\">' +
        '<img class=\"media-object pull-left\" src=\"http://placehold.it/64x64\" alt=\"Placeholder image for Skyfall\'s poster\">' +
        '<div class=\"media-body\">' +
        'Skyfall: 007' +
        '<p>Lorem ipsum dolor sit amet, consectetur.</p>' +
        '</div>' +
        '</a>' +
        '</li>' +
        '<li class=\"table-view-cell media\">' +
        '<a class=\"navigate-right\" href=\"#theater\" data-transition=\"slide-in\">' +
        '<img class=\"media-object pull-left\" src=\"http://placehold.it/64x64\" alt=\"Placeholder image for Wreck-it Ralph\'s poster\">' +
        '<div class=\"media-body\">' +
        'Wreck-it Ralph' +
        '<p>Lorem ipsum dolor sit amet, consectetur.</p>' +
        '</div>' +
        '</a>' +
        '</li>' +
        '</ul>' +
        '</div>' +
        '';
    var indexPage = basepage.extend({
        initialize: function() {
            this.page.name = "index";
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
                        pageId: 'index',
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
    new indexPage();
})