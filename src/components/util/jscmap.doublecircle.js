L.Icon.DoubleCircle = L.DivIcon.extend({
    options: {
        className: '',
        iconSize: [16, 16],
        color: 'red',
        count: 1,
        html: ``
    },
    initialize: function (options) {
        L.setOptions(this, options);
        this.options.iconAnchor = [(this.options.iconSize[0] / 2) + 2, (this.options.iconSize[1] / 2) + 2]; //因为边框2px,所以设置偏移2px
        this.options.popupAnchor = [-10, 0];
        var html = '';
        var circleclass = 'circle-';
        if (this.options.count > 1) {
            circleclass = 'dblcircle-';
        }

        if (options.color) {
            this.createCssStyles([options.color]);
        }

        this.options.className = this.options.className + ' dblcircle ' + circleclass + this.options.color.replace('#', 'rgb');
        L.DivIcon.prototype.initialize.call(this, this.options);
    },

    createCssStyles: function (colors) {
        for (var i = 0; i < colors.length; i++) {
            var css = [
                '.circle-' + colors[i].replace('#', 'rgb') + ' {border: 2px solid ' + colors[i] + ';}',
                '.dblcircle-' + colors[i].replace('#', 'rgb') + ' {border: 2px solid ' + colors[i] + ';}',
                '.dblcircle-' + colors[i].replace('#', 'rgb') + ':after{border: 2px solid ' + colors[i] + ';}',
            ].join('');
            appendCss(css, colors[i].replace('#', 'rgb'));
        }

        function appendCss(css, id) {
            var el = document.createElement('style');
            if (el.styleSheet) {
                el.styleSheet.cssText = css;
            } else {
                el.id = id;
                el.appendChild(document.createTextNode(css));
            }

            document.getElementsByTagName('head')[0].appendChild(el);
        }
    }
});

L.icon.doubleCircle = function (options) {
    return new L.Icon.DoubleCircle(options);
};

L.Marker.DoubleCircle = L.Marker.extend({
    initialize: function (latlng, options) {
        options.icon = L.icon.doubleCircle(options);
        L.Marker.prototype.initialize.call(this, latlng, options);
    }
});

L.marker.doubleCircle = function (latlng, options) {
    return new L.Marker.DoubleCircle(latlng, options);
};